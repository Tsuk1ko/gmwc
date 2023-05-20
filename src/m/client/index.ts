import type { MBaseClient } from './base';
import { MGSClient } from './gs';
import { MSRClient } from './sr';
import { MCClient } from './coin';
import { sleep } from '../../utils/sleep';

export type MClientOptions = Partial<{
  cookie: string;
  stoken: string;
  ua: string;
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
    if (stoken) this.coinClient = new MCClient(cookie, stoken, ua, () => this.coinApplySavingMode);
  }

  protected get coinApplySavingMode() {
    return this.clients.length > 0 && this.clients.every(client => client.applySavingMode);
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
