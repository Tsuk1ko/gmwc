import _ from 'lodash';
import Fs from 'fs-extra';
import Path from 'path';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import md5 from 'md5';
import { _log, _warn, _err, _setFailed } from '../utils/log';
import { retryAsync } from '../utils/retry';
import { wConsts } from '../utils/const';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const loadDataStore = require('data-store');

export interface WClientOptions {
  alc: string;
  aid: string;
  gsid: string;
  s?: string;
  from?: string;
  webhook?: string;
}

export interface WGift {
  id: string;
  name: string;
}

const CACHE_DIR = Path.resolve(__dirname, '../../cache/');
const AXIOS_COMMON_CONFIG: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
  },
  withCredentials: true,
};
const IOS_HEADERS: AxiosRequestHeaders = {
  'user-agent': wConsts[0],
};
const GIFT_IID_SUFFIX = wConsts[1];

export class WClient {
  protected cookieCacheFile: string;
  protected cookieJar: CookieJar;
  protected axios: AxiosInstance;
  protected webhook?: string;
  protected params: Pick<WClientOptions, 'aid' | 'gsid' | 's' | 'from'>;
  protected giftStore: any;
  protected static giftListMap: Record<string, WGift[]> = {};

  constructor({ alc, aid, gsid, s, from, webhook }: WClientOptions) {
    this.params = { aid, gsid, s, from };
    this.webhook = webhook;

    const cacheFilename = md5(alc);
    this.giftStore = loadDataStore({ path: Path.resolve(CACHE_DIR, `${cacheFilename}.gift.json`) });

    this.cookieCacheFile = Path.resolve(CACHE_DIR, `${cacheFilename}.cookie.json`);

    this.cookieJar = this.loadCookieFromCache();
    this.cookieJar.setCookieSync(`ALC=${alc}`, wConsts[5]);

    this.axios = Axios.create(AXIOS_COMMON_CONFIG);
    axiosCookieJarSupport(this.axios);
    this.axios.defaults.jar = this.cookieJar;
  }

  protected loadCookieFromCache(): CookieJar {
    if (!Fs.existsSync(this.cookieCacheFile)) return new CookieJar();
    _log('读取 cookie 缓存');
    try {
      return CookieJar.fromJSON(Fs.readJsonSync(this.cookieCacheFile));
    } catch {
      return new CookieJar();
    }
  }

  protected saveCookieToCache() {
    _log('保存 cookie 至缓存');
    Fs.writeJsonSync(this.cookieCacheFile, this.cookieJar.toJSON());
  }

  get cookieString(): string {
    return this.cookieJar.getCookieStringSync(wConsts[24]);
  }

  async signInAndGetGift(index: number | string) {
    if (!(await this.login())) return;

    for (const [cid, giftList] of Object.entries(WClient.giftListMap)) {
      _log(`> ${cid}`);
      await this.signIn(cid);

      // 确定需要领取的礼包
      if (!giftList.length) {
        _log('暂无可领取礼包');
        continue;
      }
      const gifts = giftList.filter(({ id }) => !this.giftStore.get(id));
      if (!gifts.length) {
        _log('暂无可领取礼包');
        continue;
      }

      for (const gift of gifts) {
        // 领取礼包
        const code = await this.getGiftCode(gift);
        if (!code) continue;

        // 发送兑换码
        if (this.webhook) {
          try {
            await Axios.get(
              _.template(this.webhook)(_.mapValues({ ...gift, code, index }, v => encodeURIComponent(v))),
            );
            _log('Webhook 调用成功');
          } catch (e: any) {
            _setFailed();
            _err('Webhook 调用失败', e.toString());
          }
        }
      }
    }
  }

  protected check200(url: string): Promise<boolean> {
    return this.axios
      .get(url, {
        validateStatus: () => true,
        maxRedirects: 0,
      })
      .then(({ status }) => status === 200);
  }

  protected isLoggedin(): Promise<boolean> {
    return retryAsync(() => this.check200(wConsts[6]));
  }

  protected async login(): Promise<boolean> {
    if (await this.isLoggedin()) {
      _log('Cookie 有效，无需重新登陆');
      return true;
    }
    _log('登录中');
    try {
      await retryAsync(() =>
        this.axios.get<string>(wConsts[8], {
          params: {
            url: wConsts[9],
            gateway: 1,
            useticket: 1,
            service: 'miniblog',
            entry: 'miniblog',
            returntype: 'META',
            _client_version: '0.6.36',
            _rand: Date.now() / 1000,
          },
        }),
      );
      if (!(await this.isLoggedin())) throw new Error('登录失败');
      _log('登录成功');
      this.saveCookieToCache();
      return true;
    } catch (e: any) {
      _err('登录失败', e.toString());
      _setFailed();
      return false;
    }
  }

  protected async signIn(cid: string): Promise<boolean> {
    _log('开始签到');
    try {
      return await retryAsync(
        () =>
          this.axios
            .get(wConsts[15], {
              params: {
                ...this.params,
                c: wConsts[3],
                request_url: `${wConsts[4]}${cid}`,
              },
              headers: IOS_HEADERS,
            })
            .then(async ({ data }) => {
              switch (data.result) {
                case 1:
                  _log('签到成功');
                  return true;
                default:
                  _setFailed();
                  _err('签到失败:', typeof data === 'string' ? data : JSON.stringify(data));
                  return false;
              }
            }),
        e => _warn('签到请求失败，进行重试', e.toString()),
      );
    } catch (e: any) {
      _setFailed();
      _err('签到请求失败', e.toString());
      return false;
    }
  }

  protected async getGiftCode({ id, name }: WGift): Promise<string | undefined> {
    try {
      return await retryAsync(
        async () => {
          const {
            data: { msg, data },
          } = await Axios.get<{
            msg: string;
            data?: { prize_data?: { card_no: string; prize_name: string } };
          }>(wConsts[25], {
            params: {
              ticket_id: id,
              ext: '',
              aid: this.params.aid,
              from: wConsts[27],
            },
            headers: {
              referer: `${wConsts[26]}?ticket_id=${id}&ext=`,
              cookie: this.cookieString,
            },
          });
          const giftName = data?.prize_data?.prize_name || name;
          const giftCard = data?.prize_data?.card_no;
          switch (msg) {
            case 'success':
              _log(`「${giftName}」领取成功`);
              if (giftCard) {
                this.giftStore.set(id, 1);
                return giftCard;
              }
              throw new Error('没有卡号');
            case 'recently':
              _log(`「${giftName}」已经领取过了`);
              this.giftStore.set(id, 1);
              break;
            case 'fail':
              _warn(`「${giftName}」未达到签到天数`);
              break;
          }
        },
        e => {
          _setFailed();
          _err('礼包领取失败', e.toString());
        },
      );
    } catch (e: any) {
      _setFailed();
      _err('失败次数过多，放弃领取');
    }
  }

  static async fetchGiftListMap(cids: Array<string | undefined>) {
    for (const cid of cids) {
      if (!cid) continue;
      WClient.giftListMap[cid] = await WClient.getGiftList(cid).catch(e => {
        _setFailed();
        _err('礼包列表请求失败', cid, e.toString());
        return [] as WGift[];
      });
    }
    _log('礼包列表', WClient.giftListMap);
  }

  protected static async getGiftList(cid: string): Promise<WGift[]> {
    const {
      data: {
        data: {
          pageInfo: { nick },
          cards,
        },
      },
    } = await retryAsync(() =>
      Axios.get<{
        data: {
          pageInfo: { nick: string };
          cards: Array<{ itemid: string }>;
        };
      }>(wConsts[21], {
        timeout: 10000,
        params: { containerid: cid },
        headers: IOS_HEADERS,
      }),
    );
    if (!cards) throw new Error('no cards');

    const itemid = cards.find(({ itemid }) => String(itemid).endsWith(GIFT_IID_SUFFIX))?.itemid;
    if (!itemid) throw new Error('no gift itemid');

    const {
      data: { card_group },
    } = await retryAsync(() =>
      Axios.get<{
        card_group: Array<{
          card_type: number;
          group: Array<{ scheme: string; title_sub: string }>;
        }>;
      }>(wConsts[22], {
        timeout: 10000,
        params: {
          from: wConsts[23],
          c: 'iphone',
          itemid,
        },
        headers: IOS_HEADERS,
      }),
    );
    if (!card_group) return [];

    const giftList: Array<{ id: string; name: string }> = [];
    for (const { card_type, group } of card_group) {
      if (card_type !== 19 || !group) continue;
      group.forEach(({ scheme, title_sub }) => {
        const id = getGiftIdFromScheme(scheme);
        if (id) giftList.push({ id, name: `《${nick}》${title_sub}` });
      });
    }
    return giftList;
  }
}

const getGiftIdFromScheme = (scheme: string): string | undefined => {
  try {
    const url = new URL(scheme).searchParams.get('url');
    if (!url) return;
    const id = new URL(url).searchParams.get('ticket_id');
    if (id) return id;
  } catch {}
};
