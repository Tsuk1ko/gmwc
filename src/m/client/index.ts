import { MGSClient } from './gs';
import { MCClient } from './coin';
import { sleep } from '../../utils/sleep';

export type MClientOptions = string | Partial<{ cookie: string; stoken: string; ua: string }>;

export class MClient {
  protected gsClient: MGSClient;
  protected coinClient?: MCClient;

  constructor(options: MClientOptions, savingMode?: boolean) {
    let { cookie, stoken, ua } =
      typeof options === 'string' ? { cookie: options, stoken: undefined, ua: undefined } : options;
    if (!cookie) throw new Error('cookie is required');
    if (ua) {
      const bbsUaReg = /miHoYoBBS\/[\d.]+$/;
      if (bbsUaReg.test(ua)) ua = ua.replace(bbsUaReg, 'miHoYoBBS/2.34.1');
      else ua = ua.replace(/ *$/, ' miHoYoBBS/2.34.1');
    }
    this.gsClient = new MGSClient(cookie, ua, savingMode);
    if (stoken) this.coinClient = new MCClient(cookie, stoken, ua, () => this.gsClient.applySavingMode);
  }

  async gsSignIn() {
    const roles = await this.gsClient.getRoles();
    for (const role of roles) {
      const status = await this.gsClient.getSignStatus(role);
      if (status?.isSign) continue;
      await this.gsClient.signIn(role);
      await sleep(3000);
    }
  }

  async earnCoin() {
    if (!this.coinClient) return;
    await this.coinClient.doTasks();
  }

  static async init() {
    await MGSClient.fetchAwards();
  }
}
