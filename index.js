const { _log, _err, _setFailed } = require('./src/utils/log');
const _ = require('lodash');
const Fs = require('fs-extra');
const { get } = require('axios').default;
const MClient = require('./src/m/client');
const WClient = require('./src/w/client');
const sleep = require('./src/utils/sleep');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const getConfig = async () => {
  let config = {};
  if (process.env.CONFIG_URL) {
    try {
      const { data } = await get(process.env.CONFIG_URL);
      config = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      _err('CONFIG_URL 配置错误', e.toString());
    }
  } else if (Fs.existsSync('config.json')) {
    try {
      config = Fs.readJsonSync('config.json');
    } catch (e) {
      _err('config.json 格式错误', e.toString());
    }
  }
  return config;
};

(async () => {
  const config = await getConfig();

  /**
   * M
   */
  const mCookies = config.m;
  if (mCookies.length) {
    _log('\nM');
    for (const cookie of mCookies) {
      const mClient = new MClient(cookie);
      const roles = await mClient.getRoles();
      for (const role of roles) {
        await mClient.checkin(role);
        await sleep(3000);
      }
    }
  }

  /**
   * W
   */
  const wConfig = config.w;
  if (wConfig.length) {
    // 获取礼包列表
    const giftList = await WClient.getGiftList().catch(e => {
      global.failed = true;
      _err('礼包列表请求失败', e.toString());
      return [];
    });

    for (const [i, { webhook, ...config }] of Object.entries(wConfig)) {
      _log(`\nW[${i}]`);
      if (!config.alc) {
        global.failed = true;
        _err('请查看 README 并更新配置');
      }

      // C
      const wClient = new WClient(config);
      if (!(await wClient.login())) continue;
      await wClient.checkin();

      // 确定需要领取的礼包
      if (!giftList.length) {
        _log('暂无可领取礼包');
        continue;
      }
      const myGiftBox = await wClient.getMyGiftBox().catch(e => {
        global.failed = true;
        _err('已领取礼包列表请求失败', e.toString());
      });
      if (!myGiftBox) continue;
      const gift = giftList.find(({ id }) => !myGiftBox.includes(id));
      if (!gift) {
        _log('暂无可领取礼包');
        continue;
      }

      // 领取礼包
      const code = await wClient.getGiftCode(gift);
      if (!code) continue;

      // 发送兑换码
      if (webhook) {
        await get(_.template(webhook)(_.mapValues({ ...gift, code, index: i }, v => encodeURIComponent(v))))
          .then(() => _log('Webhook 调用成功'))
          .catch(e => {
            global.failed = true;
            _err('Webhook 调用失败', e.toString());
          });
      }
    }
  }

  _log();

  if (global.failed) _setFailed();
})();
