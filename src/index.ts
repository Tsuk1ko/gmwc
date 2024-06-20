import { existsSync, readFileSync } from 'fs';
import { jsonc } from 'jsonc';
import { _log, _err, _isFailed } from './utils/log';
import { MClient } from './m/client';
import { dama } from './utils/dama';
import type { MClientOptions } from './m/client';
import type { PartialDeep } from './@types';

export type Config = PartialDeep<{
  users: MClientOptions[];
  m: MClientOptions[];
  cids: string[];
  failedWebhook: string;
  rrocrAppkey: string;
  savingMode: boolean;
}>;

const readJsonSync = (path: string): any => JSON.parse(readFileSync(path).toString());

const getConfig = async (): Promise<Config> => {
  let config = {};
  if (process.env.CONFIG_URL) {
    try {
      const data = await fetch(process.env.CONFIG_URL).then(r => r.text());
      config = jsonc.parse(data);
    } catch (e: any) {
      _err('CONFIG_URL 配置错误', e.toString());
    }
  } else if (existsSync('config.json')) {
    try {
      config = readJsonSync('config.json');
    } catch (e: any) {
      _err('config.json 格式错误', e.toString());
    }
  } else if (existsSync('config.jsonc')) {
    try {
      config = jsonc.parse(readFileSync('config.jsonc').toString());
    } catch (e: any) {
      _err('config.jsonc 格式错误', e.toString());
    }
  }
  return config;
};

(async () => {
  const config = await getConfig();

  dama.config(config);

  // M
  const mConfig = config.users || config.m || [];
  const { savingMode } = config;
  if (mConfig.length) {
    for (const [i, config] of Object.entries(mConfig)) {
      _log(`\nM[${i}]`);
      if (!config || (typeof config !== 'string' && !config.cookie)) continue;
      const mClient = new MClient(config, savingMode);
      await mClient.signIn();
      await mClient.earnCoin();
    }
  }

  _log();

  // webhook
  if (_isFailed() && config.failedWebhook) {
    try {
      await fetch(config.failedWebhook);
    } catch (error) {
      _err('Webhook 调用失败');
      _err(error);
    }
  }
})();
