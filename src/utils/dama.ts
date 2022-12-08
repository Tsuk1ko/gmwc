import Axios from 'axios';
import { stringify } from 'qs';
import type { Config } from '..';
import { mConsts } from './const';
import { _log, _warn } from './log';

abstract class Dama {
  public get available() {
    return true;
  }

  public gameCaptcha(gt: string, challenge: string) {
    return this.geetest(gt, challenge, mConsts[22]);
  }

  public bbsCaptcha(gt: string, challenge: string) {
    return this.geetest(gt, challenge, mConsts[23]);
  }

  public async geetest(gt: string, challenge: string, referer: string) {
    return '';
  }
}

class KuxiDama extends Dama {
  private enabled = true;

  public constructor(protected readonly token: string) {
    super();
  }

  public get available() {
    return this.enabled && !!this.token;
  }

  public async geetest(gt: string, challenge: string, referer: string) {
    const { data } = await Axios.post<{
      code: number;
      msg: string;
      data: { validate: string };
    }>(mConsts[24], {
      token: this.token,
      gt,
      challenge,
      referer,
    });
    if (data.code !== 0) {
      if (data.code === -999) this.enabled = false;
      throw new Error(`KX打码失败：(${data.code})${data.msg}`);
    }
    _log('KX打码成功');
    return data.data.validate;
  }
}

class RenrenDama extends Dama {
  public constructor(protected readonly token: string) {
    super();
  }

  public get available() {
    return !!this.token;
  }

  public async geetest(gt: string, challenge: string, referer: string) {
    const { data } = await Axios.post<{
      status: number;
      msg: string;
      data: {
        challenge: string;
        validate: string;
      };
    }>(
      'http://api.rrocr.com/api/recognize.html',
      stringify({
        appkey: this.token,
        gt,
        challenge,
        referer,
      }),
    );
    if (data.status !== 0) {
      throw new Error(`RR打码失败：(${data.status})${data.msg}`);
    }
    _log('RR打码成功');
    return data.data.validate;
  }
}

class UnifiedDama extends Dama {
  private readonly servers: Dama[] = [];

  private get availableServers() {
    return this.servers.filter(server => server.available);
  }

  public get available() {
    return this.availableServers.length > 0;
  }

  public config(config: Config) {
    if (config.kuxiToken) this.servers.push(new KuxiDama(config.kuxiToken));
    if (config.renrenToken) this.servers.push(new RenrenDama(config.renrenToken));
  }

  public async geetest(gt: string, challenge: string, referer: string) {
    for (const server of this.availableServers) {
      try {
        return await server.geetest(gt, challenge, referer);
      } catch (error: any) {
        if (server.available) throw error;
        _warn(error.toString());
      }
    }
    throw new Error('打码全失败');
  }
}

export const dama = new UnifiedDama();