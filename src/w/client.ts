import _ from 'lodash';
import Fs from 'fs-extra';
import Path from 'path';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { stringify } from 'qs';
import { load } from 'cheerio';
import md5 from 'md5';
import { _log, _warn, _err, _setFailed } from '../utils/log';
import { getAgent } from '../utils/agent';
import { retryAsync } from '../utils/retry';
import { wConsts } from '../utils/const';

export type WClientOptions = Partial<{
  alc: string;
  aid: string;
  gsid: string;
  s: string;
  from: string;
  webhook: string;
  proxy: string;
}>;

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
const KA_URL = wConsts[2];

export class WClient {
  protected useSignInV2: boolean;
  protected getSignInV2Config: (cid: string) => AxiosRequestConfig;
  protected cookieCacheFile: string;
  protected cookieJar: CookieJar;
  protected axios: AxiosInstance;
  protected proxyAxios: AxiosInstance;
  protected webhook?: string;
  protected static giftListMap: Record<string, WGift[]> = {};

  constructor({ alc, aid, gsid, s, from, proxy, webhook }: WClientOptions) {
    if (!alc) throw new Error('alc is required');
    this.webhook = webhook;
    this.useSignInV2 = !!(aid && gsid && s);
    this.getSignInV2Config = cid => ({
      params: {
        aid,
        gsid,
        s,
        from,
        c: wConsts[3],
        request_url: `${wConsts[4]}${cid}`,
      },
      headers: IOS_HEADERS,
    });

    this.cookieCacheFile = Path.resolve(CACHE_DIR, `${md5(alc)}.cookie.json`);
    const httpsAgent = getAgent(proxy);

    this.cookieJar = this.loadCookieFromCache();
    this.cookieJar.setCookieSync(`ALC=${alc}`, wConsts[5]);

    this.axios = Axios.create(AXIOS_COMMON_CONFIG);
    axiosCookieJarSupport(this.axios);
    this.axios.defaults.jar = this.cookieJar;

    if (httpsAgent) {
      this.proxyAxios = Axios.create({
        ...AXIOS_COMMON_CONFIG,
        httpsAgent,
      });
      axiosCookieJarSupport(this.proxyAxios);
      this.proxyAxios.defaults.jar = this.cookieJar;
    } else this.proxyAxios = this.axios;
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

  async signInAndGetGift(index: number | string) {
    if (!(await this.login())) return;

    const myGiftBox = await this.getMyGiftBox().catch(e => {
      _setFailed();
      _err('已领取礼包列表请求失败', e.toString());
    });

    for (const [cid, giftList] of Object.entries(WClient.giftListMap)) {
      _log(`> ${cid}`);
      await this.signIn(cid);
      if (!myGiftBox) continue;

      // 确定需要领取的礼包
      if (!giftList.length) {
        _log('暂无可领取礼包');
        continue;
      }
      const gift = giftList.find(({ id }) => !myGiftBox.has(id));
      if (!gift) {
        _log('暂无可领取礼包');
        continue;
      }

      // 领取礼包
      const code = await this.getGiftCode(gift, cid);
      if (!code) continue;

      // 发送兑换码
      if (this.webhook) {
        try {
          await Axios.get(_.template(this.webhook)(_.mapValues({ ...gift, code, index }, v => encodeURIComponent(v))));
          _log('Webhook 调用成功');
        } catch (e: any) {
          _setFailed();
          _err('Webhook 调用失败', e.toString());
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

  protected async isLoggedin(): Promise<boolean> {
    return (
      (await retryAsync(() => this.check200(wConsts[6]))) &&
      (this.useSignInV2 ? true : await retryAsync(() => this.check200(wConsts[7])))
    );
  }

  protected async login(): Promise<boolean> {
    if (await this.isLoggedin()) {
      _log('Cookie 有效，无需重新登陆');
      return true;
    }
    try {
      await retryAsync(
        () => this._login(),
        e => _warn('登录失败，进行重试', e.toString()),
      );
      return true;
    } catch (e: any) {
      _err('登录失败', e.toString());
      return false;
    }
  }

  protected async _login() {
    _log('登录中');

    const jumpUrl = await retryAsync(() =>
      this.axios
        .get<string>(wConsts[8], {
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
        })
        .then(({ data }) => {
          const search = /location\.replace\("(.+?)"\);/.exec(data);
          return search?.[1];
        }),
    );

    if (!jumpUrl) throw new Error('登录失败[0]');

    if (!this.useSignInV2) {
      const loginUrl = await retryAsync(() =>
        this.axios.get<string>(jumpUrl).then(({ data }) => {
          const search = /setCrossDomainUrlList\((.+?)\);/.exec(data);
          const json = search?.[1];
          if (!json) return;
          try {
            return JSON.parse(json).arrURL[0] as string;
          } catch (error) {
            _err(error);
          }
        }),
      );

      if (!loginUrl) throw new Error('登录失败[1]');

      await retryAsync(() =>
        this.axios.get(loginUrl, {
          params: {
            callback: wConsts[10],
            scriptId: wConsts[11],
            client: wConsts[12],
          },
        }),
      );
    }

    if (!(await this.isLoggedin())) throw new Error('登录失败[2]');
    _log('登录成功');

    this.saveCookieToCache();
  }

  protected async signIn(cid: string) {
    await (this.useSignInV2 ? this.signInV2(cid) : this.signInV1(cid));
  }

  protected async signInV1(cid: string): Promise<boolean> {
    _log('开始使用网页版 API 签到');
    try {
      return await retryAsync(
        () =>
          this.proxyAxios
            .get(wConsts[13], {
              params: {
                api: wConsts[14],
                id: cid,
              },
            })
            .then(async ({ data }) => {
              switch (data.code) {
                case '100000':
                  _log('签到成功');
                  return true;
                case 382004:
                  _warn('今天已经签到过了');
                  return false;
                default:
                  _setFailed();
                  _err('签到失败:', typeof data === 'string' ? data : JSON.stringify(_.pick(data, ['code', 'msg'])));
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

  protected async signInV2(cid: string): Promise<boolean> {
    _log('开始使用国际版 API 签到');
    try {
      return await retryAsync(
        () =>
          this.axios.get(wConsts[15], this.getSignInV2Config(cid)).then(async ({ data }) => {
            switch (data.result) {
              case 1:
                _log('签到成功');
                return true;
              default:
                _setFailed();
                _err('签到失败:', typeof data === 'string' ? data : JSON.stringify(_.pick(data, ['result', 'msg'])));
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

  protected async getMyGiftBox(): Promise<Set<string>> {
    const { data } = await retryAsync(() => this.axios.get<string>(wConsts[6]));
    const $ = load(data);
    return new Set(Array.from($('.gift-box .deleBtn')).map(el => $(el).attr('data-itemid')!));
  }

  protected async getGiftCode({ id, name }: WGift, cid: string): Promise<string | undefined> {
    try {
      return await retryAsync(
        async () => {
          const {
            data: { msg, data },
          } = await this.axios.get<{ msg: string; data?: { kahao: string } }>(wConsts[16], {
            params: {
              gid: '10725',
              itemId: id,
              channel: wConsts[17],
            },
            headers: {
              referer: `${wConsts[18]}${id}?${stringify({
                channel: wConsts[17],
                luicode: wConsts[19],
                lfid: `${cid}${wConsts[20]}`,
              })}`,
            },
          });
          if (data?.kahao) {
            _log(`「${name}」领取成功`);
            return data.kahao;
          }
          if (msg.includes('领卡拥挤')) throw new Error(msg);
          (/签到\d+天以上才能领取/.test(String(msg)) ? _warn : _err)(
            `「${name}」领取失败：${String(msg).replace(/亲爱的.+?，/, '')}`,
          );
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
      Axios.get<{ card_group: Array<{ group: Array<{ scheme: string; title_sub: string }> }> }>(wConsts[22], {
        timeout: 10000,
        params: {
          from: wConsts[23],
          c: 'iphone',
          itemid,
        },
        headers: IOS_HEADERS,
      }),
    );

    const list = (() => {
      if (!card_group) return [];
      for (const { group } of card_group) {
        if (!group) continue;
        const tmp = group.filter(({ scheme }) => String(scheme).startsWith(KA_URL));
        if (tmp.length) return tmp;
      }
      return [];
    })();

    return list.map(({ title_sub, scheme }) => ({
      id: String(/(?<=gift\/)\d+/.exec(scheme)),
      name: `${nick}${title_sub}`,
    }));
  }
}
