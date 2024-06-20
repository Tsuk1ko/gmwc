import { keyBy, map, pullAll } from 'lodash-es';
import Axios from 'axios';
import { ds2, ds } from '../ds';
import { dvid } from '../dvid';
import { Cookie } from '../../utils/cookie';
import { _err, _log, _setFailed, _warn } from '../../utils/log';
import { maskId } from '../../utils/mask';
import { retryAsync } from '../../utils/retry';
import { sleep } from '../../utils/sleep';
import { dama } from '../../utils/dama';
import {
  DEFAULT_UA,
  BBS_TASK_LIST_URL,
  BBS_SIGN_URL,
  BBS_VIEW_POST_URL,
  BBS_LIKE_POST_URL,
  BBS_SHARE_POST_URL,
  BBS_CLIENT_TYPE,
  APP_VERSION,
  BBS_POST_LIST_URL_OLD,
} from '../config';
import type { AxiosInstance } from 'axios';

const forumMap = {
  gs: {
    id: 2,
    forumId: 26,
  },
  sr: {
    id: 6,
    forumId: 52,
  },
} as const;

export type MCForum = keyof typeof forumMap;

interface MCClientParams {
  cookie: string;
  stoken: string;
  ua?: string;
  forum?: MCForum;
}

export class MCClient {
  protected static postIdsMap = new Map<number, string[]>();
  protected static failedPostIdsMap = new Map<number, string[]>();

  protected axios: AxiosInstance;
  protected forum: MCForum = 'gs';

  constructor(
    { cookie, stoken, ua, forum }: MCClientParams,
    protected readonly savingMode = false,
  ) {
    const cookieMap = new Cookie(cookie);
    const stuid = cookieMap.get('login_uid') || cookieMap.get('ltuid') || cookieMap.get('account_id');
    if (!stuid) throw new Error('Cookie 不完整，请尝试重新获取');
    cookieMap.set('stuid', stuid);
    cookieMap.set('stoken', stoken);
    if (forum) this.forum = forum;
    this.axios = Axios.create({
      headers: {
        'x-rpc-client_type': BBS_CLIENT_TYPE,
        'x-rpc-app_version': APP_VERSION,
        'x-rpc-sys_version': '12',
        'x-rpc-channel': 'miyousheluodi',
        'x-rpc-device_name': 'XiaoMi',
        'x-rpc-device_model': 'Mi 10',
        'x-rpc-device_id': dvid(),
        ds: ds(),
        referer: 'https://app.mihoyo.com',
        cookie: cookieMap.toString(),
        'user-agent': ua || DEFAULT_UA,
      },
    });
  }

  get applySavingMode() {
    return this.savingMode;
  }

  protected get gids() {
    return forumMap[this.forum].id;
  }

  protected get forumId() {
    return forumMap[this.forum].forumId;
  }

  protected get postIds() {
    if (!MCClient.postIdsMap.has(this.forumId)) {
      MCClient.postIdsMap.set(this.forumId, []);
    }
    return MCClient.postIdsMap.get(this.forumId)!;
  }

  protected set postIds(ids: string[]) {
    MCClient.postIdsMap.set(this.forumId, ids);
  }

  protected get failedPostIds() {
    if (!MCClient.failedPostIdsMap.has(this.forumId)) {
      MCClient.failedPostIdsMap.set(this.forumId, []);
    }
    return MCClient.failedPostIdsMap.get(this.forumId)!;
  }

  protected set failedPostIds(ids: string[]) {
    MCClient.failedPostIdsMap.set(this.forumId, ids);
  }

  async doTasks() {
    const taskList = await this.getTaskList();
    if (!taskList) return;
    if (!taskList.length) {
      _log('任务已全部完成');
      return;
    }
    await this.fetchPostIds();
    if (!this.postIds.length) {
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
          func: this.likePost,
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
      }>(BBS_TASK_LIST_URL);
      if (retcode !== 0) {
        _err(`获取任务列表失败(${retcode})：${message}`);
        _setFailed();
        return;
      }
      const taskStateMap = keyBy(data.states, 'mission_id');
      return map(taskMap, ({ times, func }, id) => ({
        times: times - (taskStateMap[id]?.happened_times ?? 0),
        func,
      })).filter(({ times }) => times > 0);
    } catch (e: any) {
      _err('获取任务列表失败', e);
      _setFailed();
    }
  }

  protected async signIn(times?: number, challenge?: string) {
    try {
      const postData = { gids: this.gids };
      const {
        data: { retcode, message, data },
      } = await retryAsync(
        () =>
          this.axios.post<{
            retcode: number;
            message: string;
            data?: { points: number };
          }>(BBS_SIGN_URL, postData, {
            headers: {
              ds: ds2(postData),
              ...(challenge ? { 'x-rpc-challenge': challenge } : {}),
            },
          }),
        e => _warn('签到失败，进行重试', e.toString()),
      );
      if (retcode === 0) {
        _log(`签到成功，获得 ${data?.points || '?'} 币`);
        return;
      }
      if (retcode === 1034) {
        if (dama.available && !challenge) {
          if (this.applySavingMode && dama.savingModeAvailable) {
            _log('出现验证码，节约模式生效，跳过');
            return;
          }
          _log('出现验证码，尝试打码');
          const challenge = await this.getChallenge();
          if (challenge) {
            await this.signIn(times, challenge);
            return;
          }
        }
        _err('由于验证码，签到请求失败');
        _setFailed();
        return;
      }
      _err(`签到失败(${retcode})：${message}`);
      _setFailed();
    } catch (e: any) {
      if (e.applySavingMode) {
        _log(e.toString());
        return;
      }
      _err('签到失败', e);
      _setFailed();
    }
  }

  async fetchPostIds() {
    if (this.postIds.length) return;
    try {
      const {
        data: { retcode, message, data },
      } = await retryAsync(
        () =>
          Axios.get<{
            retcode: number;
            message: string;
            data?: { list: Array<{ post: { post_id: string } }> };
          }>(BBS_POST_LIST_URL_OLD, {
            params: {
              forum_id: this.forumId,
              gids: this.gids,
              is_good: false,
              is_hot: false,
              page_size: 20,
              sort_type: 1,
            },
          }),
        e => _warn(`获取帖子列表(${this.forum})失败，进行重试`, e.toString()),
      );
      if (retcode !== 0) {
        _err(`获取帖子列表(${this.forum})失败(${retcode})：${message}`);
        _setFailed();
        return;
      }
      this.postIds = data?.list.map(item => item.post.post_id) || [];
    } catch (e: any) {
      _err(`获取帖子列表(${this.forum})失败`, e);
      _setFailed();
    }
  }

  protected async viewPost(times = 3, postIds = this.postIds) {
    times += 1; // 容易漏一个不知道为啥
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
            }>(BBS_VIEW_POST_URL, { params: { post_id } }),
          e => _warn(`看帖 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`看帖 ${maskedPostId} 失败(${retcode})：${message}`);
          this.markFailedPostId(post_id);
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
    this.removeFailedPostIds();
  }

  protected async likePost(times = 5, postIds = this.postIds) {
    times += 1; // 容易漏一个不知道为啥
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
            }>(BBS_LIKE_POST_URL, { post_id, is_cancel: false }),
          e => _warn(`点赞 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`点赞 ${maskedPostId} 失败(${retcode})：${message}`);
          this.markFailedPostId(post_id);
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
              }>(BBS_LIKE_POST_URL, { post_id, is_cancel: true }),
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
    this.removeFailedPostIds();
  }

  protected async sharePost(times = 1, postIds = this.postIds) {
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
            }>(BBS_SHARE_POST_URL, {
              params: { entity_id: post_id, entity_type: 1 },
            }),
          e => _warn(`分享 ${maskedPostId} 失败，进行重试`, e.toString()),
        );
        if (retcode !== 0) {
          _warn(`分享 ${maskedPostId} 失败(${retcode})：${message}`);
          this.markFailedPostId(post_id);
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
    this.removeFailedPostIds();
  }

  protected getChallenge() {
    return retryAsync(
      async () => {
        const { data: gtData } = await this.axios.get<{ retcode: number; data: { gt: string; challenge: string } }>(
          'https://bbs-api.mihoyo.com/misc/api/createVerification?is_high=true',
        );
        if (gtData.retcode !== 0) return;
        const { gt, challenge } = gtData.data;
        const validate = await dama.bbsCaptcha(gt, challenge);
        const { data: checkData } = await this.axios.post<{ retcode: number; data: { challenge: string } }>(
          'https://bbs-api.mihoyo.com/misc/api/verifyVerification',
          {
            geetest_challenge: challenge,
            geetest_seccode: `${validate}|jordan`,
            geetest_validate: validate,
          },
        );
        if (checkData.retcode === 0) return checkData.data.challenge;
      },
      e => _warn('验证码失败，进行重试', e.toString()),
    );
  }

  protected markFailedPostId(id: string) {
    this.failedPostIds.push(id);
  }

  protected removeFailedPostIds() {
    if (!this.failedPostIds.length) return;
    pullAll(this.postIds, this.failedPostIds);
    this.failedPostIds = [];
  }
}
