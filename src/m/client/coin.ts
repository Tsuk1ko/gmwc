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

  constructor(cookie: string, stoken: string) {
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
      },
    });
  }

  async doTasks() {
    if (!MCClient.postIds.length) await MCClient.fetchPostIds();
    await this.signIn();
    if (!MCClient.postIds.length) {
      _err('无贴可用');
      _setFailed();
      return;
    }
    await this.readPosts(MCClient.postIds);
    await this.upvotePosts(MCClient.postIds);
    await this.sharePosts(MCClient.postIds);
  }

  protected async signIn() {
    try {
      const postData = { gids: 2 };
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
      _err(`签到失败(${retcode})：${message}`);
      _setFailed();
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
              is_good: false,
              is_hot: false,
              page_size: 20,
              sort_type: 1,
            },
          }),
        e => _warn('获取帖子列表失败，进行重试', e.toString()),
      );
      if (retcode !== 0) {
        _err(`获取帖子列表失败(${retcode})：${message}`);
        _setFailed();
        return;
      }
      MCClient.postIds = data?.list.map(item => item.post.post_id) || [];
    } catch (e: any) {
      _err('获取帖子列表失败', e);
      _setFailed();
    }
  }

  protected async readPosts(postIds: string[], num = 3) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= num) break;
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
    if (success < num) {
      _err(`未能完成看帖 ${num} 个任务`);
      _setFailed();
    }
  }

  protected async upvotePosts(postIds: string[], num = 5) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= num) break;
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
    if (success < num) {
      _err(`未能完成点赞 ${num} 次任务`);
      _setFailed();
    }
  }

  protected async sharePosts(postIds: string[], num = 1) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= num) break;
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
    if (success < num) {
      _err(`未能完成分享 ${num} 次任务`);
      _setFailed();
    }
  }
}
