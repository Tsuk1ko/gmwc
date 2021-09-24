const { _log, _warn, _err } = require('../utils/log');
const _ = require('lodash');
const Fs = require('fs-extra');
const Path = require('path');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const { CookieJar } = require('tough-cookie');
const { stringify } = require('qs');
const { load } = require('cheerio');
const md5 = require('md5');
const { decode } = require('js-base64');
const getAgent = require('../utils/getAgent');
const retryPromise = require('../utils/retryPromise');

const CACHE_DIR = Path.resolve(__dirname, '../../cache/');
const CONTAINER_ID = decode('MTAwODA4ZmM0MzlkZWRiYjA2Y2E1ZmQ4NTg4NDhlNTIxYjg3MTY=');
const ITEM_ID = decode('MjMyNDc2ZmM0MzlkZWRiYjA2Y2E1ZmQ4NTg4NDhlNTIxYjg3MTY=');
const AXIOS_COMMON_CONFIG = {
  timeout: 10000,
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
  },
  withCredentials: true,
};
const IOS_HEADERS = {
  headers: { 'user-agent': decode('V2VpYm9PdmVyc2Vhcy80LjMuNSAoaVBob25lOyBpT1MgMTQuNjsgU2NhbGUvMy4wMCk=') },
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class WClient {
  constructor({ alc, proxy, aid, gsid, s, from }) {
    if (aid && gsid && s) {
      this.appCheckinConfig = {
        params: {
          aid,
          gsid,
          s,
          from,
          c: decode('d2VpY29hYnJvYWQ='),
          request_url: `${decode(
            'aHR0cDovL2kuaHVhdGkud2VpYm8uY29tL21vYmlsZS9zdXBlci9hY3RpdmVfZmNoZWNraW4/cGFnZWlkPQ==',
          )}${CONTAINER_ID}`,
        },
        headers: IOS_HEADERS,
      };
    }

    this.cookieCacheFile = Path.resolve(CACHE_DIR, `${md5(alc)}.cookie.json`);
    const httpsAgent = getAgent(proxy);

    this.cookieJar = this.loadCookieFromCache();
    this.cookieJar.setCookieSync(`ALC=${alc}`, decode('aHR0cHM6Ly9sb2dpbi5zaW5hLmNvbS5jbi8='));

    this.axios = axios.create(AXIOS_COMMON_CONFIG);
    axiosCookieJarSupport(this.axios);
    this.axios.defaults.jar = this.cookieJar;

    if (httpsAgent) {
      this.proxyAxios = axios.create({
        ...AXIOS_COMMON_CONFIG,
        httpsAgent,
      });
      axiosCookieJarSupport(this.proxyAxios);
      this.proxyAxios.defaults.jar = this.cookieJar;
    } else this.proxyAxios = this.axios;
  }

  loadCookieFromCache() {
    if (!Fs.existsSync(this.cookieCacheFile)) return new CookieJar();
    _log('读取 cookie 缓存');
    try {
      return CookieJar.fromJSON(Fs.readJsonSync(this.cookieCacheFile));
    } catch (error) {
      return new CookieJar();
    }
  }

  saveCookieToCache() {
    _log('保存 cookie 至缓存');
    Fs.writeJsonSync(this.cookieCacheFile, this.cookieJar.toJSON());
  }

  check200(url) {
    return this.axios
      .get(url, {
        validateStatus: () => true,
        maxRedirects: 0,
      })
      .then(({ status }) => status === 200);
  }

  async isLoggedin() {
    return (
      (await retryPromise(() => this.check200(decode('aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9odG1sNS9teWJveA==')))) &&
      (this.appCheckinConfig
        ? true
        : await retryPromise(() => this.check200(decode('aHR0cHM6Ly93ZWliby5jb20vYWovYWNjb3VudC93YXRlcm1hcms='))))
    );
  }

  login() {
    return retryPromise(
      () => this._login().then(() => true),
      e => _warn('登录失败，进行重试', e.toString()),
    ).catch(e => {
      _err('登录失败', e.toString());
      return false;
    });
  }

  async _login() {
    if (await this.isLoggedin()) {
      _log('Cookie 有效，无需重新登陆');
      return;
    }
    _log('登录中');

    const jumpUrl = await retryPromise(() =>
      this.axios
        .get(decode('aHR0cHM6Ly9sb2dpbi5zaW5hLmNvbS5jbi9zc28vbG9naW4ucGhw'), {
          params: {
            url: decode('aHR0cHM6Ly93ZWliby5jb20veXNtaWhveW8='),
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
          return search && search[1];
        }),
    );

    if (!jumpUrl) throw new Error('登录失败[0]');

    const loginUrl = await retryPromise(() =>
      this.axios.get(jumpUrl).then(({ data }) => {
        const search = /setCrossDomainUrlList\((.+?)\);/.exec(data);
        const json = search && search[1];
        try {
          return JSON.parse(json).arrURL[0];
        } catch (error) {
          _err(error);
        }
      }),
    );

    if (!loginUrl) throw new Error('登录失败[1]');

    if (!this.appCheckinConfig) {
      await retryPromise(() =>
        this.axios.get(loginUrl, {
          params: {
            callback: decode('c2luYVNTT0NvbnRyb2xsZXIuZG9Dcm9zc0RvbWFpbkNhbGxCYWNr'),
            scriptId: decode('c3Nvc2NyaXB0MA=='),
            client: decode('c3NvbG9naW4uanModjEuNC4yKQ=='),
          },
        }),
      );
    }

    if (!(await this.isLoggedin())) throw new Error('登录失败[2]');
    _log('登录成功');

    this.saveCookieToCache();
  }

  checkin() {
    return this.appCheckinConfig ? this.checkinV2() : this.checkinV1();
  }

  checkinV1() {
    _log('开始使用网页版 API C');
    return retryPromise(
      () =>
        this.proxyAxios
          .get(decode('aHR0cHM6Ly93ZWliby5jb20vcC9hai9nZW5lcmFsL2J1dHRvbg=='), {
            params: {
              api: decode('aHR0cDovL2kuaHVhdGkud2VpYm8uY29tL2FqL3N1cGVyL2NoZWNraW4='),
              id: CONTAINER_ID,
            },
          })
          .then(async ({ data }) => {
            switch (data.code) {
              case '100000':
                _log('C 成功');
                return true;
              case 382004:
                _warn('今天已经 C 过了');
                return false;
              default:
                global.failed = true;
                _err('C 失败:', typeof data === 'string' ? data : JSON.stringify(_.pick(data, ['code', 'msg'])));
                return false;
            }
          }),
      e => _warn('C 请求失败，进行重试', e.toString()),
    ).catch(e => {
      global.failed = true;
      _err('C 请求失败', e.toString());
    });
  }

  checkinV2() {
    _log('开始使用国际版 API C');
    return retryPromise(
      () =>
        this.axios
          .get(decode('aHR0cHM6Ly9hcGkud2VpYm8uY24vMi9wYWdlL2J1dHRvbg=='), this.appCheckinConfig)
          .then(async ({ data }) => {
            switch (data.result) {
              case 1:
                _log('C 成功');
                return true;
              default:
                global.failed = true;
                _err('C 失败:', typeof data === 'string' ? data : JSON.stringify(_.pick(data, ['result', 'msg'])));
                return false;
            }
          }),
      e => _warn('C 请求失败，进行重试', e.toString()),
    ).catch(e => {
      global.failed = true;
      _err('C 请求失败', e.toString());
    });
  }

  async getMyGiftBox() {
    const { data } = await retryPromise(() =>
      this.axios.get(decode('aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9odG1sNS9teWJveA==')),
    );
    const $ = load(data);
    return Array.from($('.gift-box .deleBtn')).map(el => $(el).attr('data-itemid'));
  }

  getGiftCode({ id, name }, retry = 9) {
    return this.axios
      .get(decode('aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9pbm5lcmFwaS9kcmF3'), {
        params: {
          gid: '10725',
          itemId: id,
          channel: decode('d2JsaW5r'),
        },
        headers: {
          referer: `${decode('aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9odG1sNS9naWZ0Lw==')}${id}?${stringify({
            channel: decode('d2JsaW5r'),
            luicode: decode('MTAwMDAwMTE='),
            lfid: `${CONTAINER_ID}${decode('Xy1fZmVlZA==')}`,
          })}`,
        },
      })
      .then(async ({ data: { msg, data } }) => {
        if (data && data.kahao) {
          _log(`「${name}」领取成功`);
          return data.kahao;
        }
        _err(`「${name}」领取失败：${String(msg).replace(/亲爱的.+?，/, '')}`);
        if (retry <= 0) {
          global.failed = true;
          _err('失败次数过多，放弃 C');
          return;
        }
        if (msg.includes('领卡拥挤')) {
          _log('将在5秒后重试');
          await sleep(5000);
          return this.getGiftCode({ id, name }, retry - 1);
        }
      })
      .catch(e => {
        global.failed = true;
        _err('礼包领取请求失败', e.toString());
      });
  }

  static async getGiftList() {
    const { data } = await retryPromise(() =>
      axios.get(decode('aHR0cHM6Ly9hcGkud2VpYm8uY24vMi9jb250YWluZXIvZ2V0X2l0ZW0='), {
        timeout: 10000,
        params: {
          from: decode('MTBCOTI5MzAxMA=='),
          c: 'iphone',
          itemid: `${ITEM_ID}${decode('Xy1fcGFnZV9pbmZlZWRfYXN5bmNtaXg=')}`,
        },
        headers: IOS_HEADERS,
      }),
    );

    const list = (() => {
      const { card_group } = data;
      if (!card_group) [];
      for (const { group } of card_group) {
        if (!group) continue;
        const tmp = group.filter(({ scheme }) => String(scheme).startsWith(decode('aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbg==')));
        if (tmp.length) return tmp;
      }
      return [];
    })();

    return list.map(({ title_sub, scheme }) => ({
      id: String(/(?<=gift\/)\d+/.exec(scheme)),
      name: title_sub,
    }));
  }
};
