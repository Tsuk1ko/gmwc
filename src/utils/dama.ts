import Axios from 'axios';
import { mConsts } from './const';
import { _err, _log } from './log';

class KuxiDama {
  protected token?: string;

  get available() {
    return !!this.token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public gameCaptcha(gt: string, challenge: string) {
    return this.geetest(gt, challenge, mConsts[22]);
  }

  public bbsCaptcha(gt: string, challenge: string) {
    return this.geetest(gt, challenge, mConsts[23]);
  }

  protected async geetest(gt: string, challenge: string, referer: string) {
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
      _err(`打码失败：${data.msg}`);
      return;
    }
    _log('打码成功');
    return data.data.validate;
  }
}

export const kuxiDama = new KuxiDama();
