import _ from 'lodash';
import Axios, { AxiosInstance } from 'axios';
import { mConsts } from '../../utils/const';
import { Cookie } from '../../utils/cookie';
import { _err, _log, _setFailed, _warn } from '../../utils/log';
import { maskId } from '../../utils/mask';
import { retryAsync } from '../../utils/retry';
import { sleep } from '../../utils/sleep';
import { coinDs, ds } from '../ds';
import { dvid } from '../dvid';

export class MCClient {
  protected axios: AxiosInstance;
  protected static postIds: string[] = [];
  protected static fetchPostIdsFailed = false;

  constructor(cookie: string, stoken: string, ua?: string) {
    const cookieMap = new Cookie(cookie);
    const stuid = cookieMap.get('login_uid') || cookieMap.get('ltuid') || cookieMap.get('account_id');
    if (!stuid) throw new Error('Cookie 不完整，请尝试重新获取');
    cookieMap.set('stuid', stuid);
    cookieMap.set('stoken', stoken);
    this.axios = Axios.create({
      headers: {
        ...JSON.parse(mConsts[13]),
        [mConsts[2]]: dvid(),
        ds: ds(),
        referer: mConsts[14],
        cookie: cookieMap.toString(),
        'user-agent': ua || mConsts[5],
      },
    });
  }

  async doTasks() {
    const taskList = await this.getTaskList();
    if (!taskList) return;
    if (!taskList.length) {
      _log('任务已全部完成');
      return;
    }
    if (!MCClient.postIds.length && !MCClient.fetchPostIdsFailed) {
      await MCClient.fetchPostIds();
    }
    if (!MCClient.postIds.length) {
      _warn('无贴可用');
      _setFailed();
    }
    for (const { times, func } of taskList) {
      await func.call(this, times);
    }
  }

  protected async getTaskList() {
    try {
      const taskMap: Record<string, { times: number; func: Function }> = {
        58: {
          times: 1,
          func: this.signIn,
        },
        59: {
          times: 3,
          func: this.viewPost,
        },
        60: {
          times: 5,
          func: this.postUp,
        },
        61: {
          times: 1,
          func: this.sharePost,
        },
      };
      const {
        data: { retcode, message, data },
      } = await this.axios.get<{
        retcode: number;
        message: string;
        data: {
          states: Array<{
            mission_id: number;
            happened_times: number;
          }>;
        };
      }>(mConsts[21]);
      if (retcode !== 0) {
        _err(`获取任务列表失败(${retcode})：${message}`);
        _setFailed();
        return;
      }
      const taskStateMap = _.keyBy(data.states, 'mission_id');
      return _.map(taskMap, ({ times, func }, id) => ({
        times: times - (taskStateMap[id]?.happened_times ?? 0),
        func,
      })).filter(({ times }) => times > 0);
    } catch (e: any) {
      _err('获取任务列表失败', e);
      _setFailed();
    }
  }

  protected async signIn() {
    try {
      const postData = { gids: 2 };
      for (let retry = 1; retry <= 4; retry++) {
        const {
          data: { retcode, message, data },
        } = await retryAsync(
          () =>
            this.axios.post<{
              retcode: number;
              message: string;
              data?: { points: number };
            }>(mConsts[15], postData, { headers: { ds: coinDs(postData) } }),
          e => _warn('签到失败，进行重试', e.toString()),
        );
        if (retcode === 0) {
          _log(`签到成功，获得 ${data?.points || '?'} 币`);
          return;
        }
        if (retcode === 1034) {
          if (retry >= 4) {
            _err('因验证码签到失败，请尝试手动签到一段时间再使用');
            _setFailed();
            return;
          }
          _warn(`讨论区签到出现验证码，尝试重试 ${retry}/3`);
          await sleep(Math.round(_.random(10, 15) * 1000));
          continue;
        }
        _err(`签到失败(${retcode})：${message}`);
        _setFailed();
        break;
      }
    } catch (e: any) {
      _err('签到失败', e);
      _setFailed();
    }
  }

  static async fetchPostIds() {
    try {
      const {
        data: { retcode, message, data },
      } = await retryAsync(
        () =>
          Axios.get<{
            retcode: number;
            message: string;
            data?: { list: Array<{ post: { post_id: string } }> };
          }>(mConsts[16], {
            params: {
              forum_id: 26,
              gids: 2,
              is_good: false,
              is_hot: false,
              page_size: 20,
              sort_type: 1,
            },
          }),
        e => _warn('获取帖子列表失败，进行重试', e.toString()),
      );
      if (retcode !== 0) {
        this.fetchPostIdsFailed = true;
        _err(`获取帖子列表失败(${retcode})：${message}`);
        _setFailed();
        return;
      }
      MCClient.postIds = data?.list.map(item => item.post.post_id) || [];
    } catch (e: any) {
      this.fetchPostIdsFailed = true;
      _err('获取帖子列表失败', e);
      _setFailed();
    }
  }

  protected async viewPost(times = 3, postIds = MCClient.postIds) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times) break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message },
        } = await retryAsync(
          () =>
            this.axios.get<{
              retcode: number;
              message: string;
            }>(mConsts[17], { params: { post_id } }),
          e => _warn(`看帖 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`看帖 ${maskedPostId} 失败(${retcode})：${message}`);
          continue;
        }
        success++;
        _log(`看帖 ${maskedPostId} 成功`);
      } catch (e: any) {
        _warn(`看帖 ${maskedPostId} 失败`, e);
      }
    }
    if (success < times) {
      _err(`未能完成看帖 ${times} 个任务`);
      _setFailed();
    }
  }

  protected async postUp(times = 5, postIds = MCClient.postIds) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times) break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message },
        } = await retryAsync(
          () =>
            this.axios.post<{
              retcode: number;
              message: string;
            }>(mConsts[18], { post_id, is_cancel: false }),
          e => _warn(`点赞 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`点赞 ${maskedPostId} 失败(${retcode})：${message}`);
          continue;
        }
        success++;
        _log(`点赞 ${maskedPostId} 成功`);
        await sleep(500);
        try {
          const {
            data: { retcode, message },
          } = await retryAsync(
            () =>
              this.axios.post<{
                retcode: number;
                message: string;
              }>(mConsts[18], { post_id, is_cancel: true }),
            e => _warn(`取消点赞 ${maskedPostId} 失败，进行重试`, e.toString()),
          );
          if (retcode !== 0) {
            _warn(`取消点赞 ${maskedPostId} 失败(${retcode})：${message}`);
          }
        } catch (e: any) {
          _warn(`取消点赞 ${maskedPostId} 失败`, e);
        }
      } catch (e: any) {
        _warn(`点赞 ${maskedPostId} 失败`, e);
      }
    }
    if (success < times) {
      _err(`未能完成点赞 ${times} 次任务`);
      _setFailed();
    }
  }

  protected async sharePost(times = 1, postIds = MCClient.postIds) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times) break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message },
        } = await retryAsync(
          () =>
            this.axios.get<{
              retcode: number;
              message: string;
            }>(mConsts[19], {
              params: { entity_id: post_id, entity_type: 1 },
            }),
          e => _warn(`分享 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`分享 ${maskedPostId} 失败(${retcode})：${message}`);
          continue;
        }
        success++;
        _log(`分享 ${maskedPostId} 成功`);
      } catch (e: any) {
        _warn(`分享 ${maskedPostId} 失败`, e);
      }
    }
    if (success < times) {
      _err(`未能完成分享 ${times} 次任务`);
      _setFailed();
    }
  }
}
