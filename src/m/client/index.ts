import { sleep } from '../../utils/sleep';
import { MGSClient } from './gs';
import { MSRClient } from './sr';
import { MCClient, type MCForum } from './coin';
import type { MBaseClient } from './base';

export type MClientOptions = Partial<{
  cookie: string;
  stoken: string;
  ua: string;
  forum: MCForum;
  enableGs: boolean;
  enableSr: boolean;
}>;

export class MClient {
  protected clients: MBaseClient[] = [];
  protected coinClient?: MCClient;

  constructor(options: MClientOptions | string, savingMode?: boolean) {
    let {
      cookie,
      stoken,
      ua,
      forum,
      enableGs = true,
      enableSr = false,
    }: MClientOptions = typeof options === 'string' ? { cookie: options } : options;
    if (!cookie) throw new Error('cookie is required');
    if (ua) {
      const bbsUaReg = /miHoYoBBS\/[\d.]+$/;
      if (bbsUaReg.test(ua)) ua = ua.replace(bbsUaReg, 'miHoYoBBS/2.34.1');
      else ua = ua.replace(/ *$/, ' miHoYoBBS/2.34.1');
    }
    if (enableGs) this.clients.push(new MGSClient(cookie, ua, savingMode));
    if (enableSr) this.clients.push(new MSRClient(cookie, ua, savingMode));
    if (stoken) this.coinClient = new MCClient({ cookie, stoken, ua, forum }, savingMode);
  }

  async signIn() {
    for (const client of this.clients) {
      const roles = await client.getRoles();
      for (const role of roles) {
        const status = await client.getSignStatus(role);
        if (status?.isSign) continue;
        await client.signIn(role);
        await sleep(3000);
      }
    }
  }

  async earnCoin() {
    if (!this.coinClient) return;
    await this.coinClient.doTasks();
  }
}
