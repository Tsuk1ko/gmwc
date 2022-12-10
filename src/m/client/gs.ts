import Axios, { AxiosInstance } from 'axios';
import { ds } from '../ds';
import { dvid } from '../dvid';
import { _log, _warn, _err, _setFailed } from '../../utils/log';
import { retryAsync } from '../../utils/retry';
import { mConsts } from '../../utils/const';
import { maskId } from '../../utils/mask';
import { dama } from '../../utils/dama';

export interface MGSRole {
  region: string;
  game_uid: string;
  region_name: string;
}

interface MGSAwards {
  name: string;
  cnt: number;
}

export class MGSClient {
  protected static awards?: MGSAwards[];

  protected readonly axios: AxiosInstance;
  protected totalSignDay = NaN;

  constructor(cookie: string, ua?: string, protected readonly savingMode = false) {
    this.axios = Axios.create({
      timeout: 10000,
      baseURL: mConsts[1],
      headers: {
        [mConsts[2]]: dvid(),
        [mConsts[3]]: '5',
        [mConsts[4]]: '2.34.1',
        'user-agent': ua || mConsts[5],
        cookie,
      },
    });
  }

  protected get award() {
    const award = MGSClient.awards?.[this.totalSignDay + 1];
    if (!award) return '未知';
    return `${award.name}*${award.cnt}`;
  }

  protected get hasGotAllPrimogem() {
    if (!MGSClient.awards || !this.totalSignDay) return false;
    const gotPrimogemAwards = MGSClient.awards.slice(0, this.totalSignDay).filter(({ name }) => name === '原石');
    return gotPrimogemAwards.length >= 3;
  }

  get applySavingMode() {
    return this.savingMode && this.hasGotAllPrimogem;
  }

  async getRoles(): Promise<MGSRole[]> {
    try {
      return await retryAsync(
        () =>
          this.axios.get<{ data?: { list?: MGSRole[] } }>(mConsts[9]).then(({ data }) => {
            const list = data?.data?.list;
            if (!list) {
              _setFailed();
              _err(JSON.stringify(data));
              return [] as MGSRole[];
            }
            return list;
          }),
        e => _warn('角色信息请求失败，进行重试', e.toString()),
      );
    } catch (e: any) {
      _setFailed();
      _err('角色信息请求失败', e.toString());
      return [] as MGSRole[];
    }
  }

  async getSignStatus(role: MGSRole) {
    const { region, game_uid: uid, region_name: regionName } = role;
    const maskedUid = maskId(uid);
    try {
      return await retryAsync(
        async () => {
          const { data } = await this.axios.get<{
            retcode: number;
            message: string;
            data: { total_sign_day: number; is_sign: boolean };
          }>(mConsts[25], { params: { act_id: mConsts[0], region, uid } });
          if (data.retcode !== 0) {
            _err(maskedUid, regionName, `获取签到状态失败：(${data.retcode})${data.message}`);
            return;
          }
          const { total_sign_day: totalSignDay, is_sign: isSign } = data.data;
          this.totalSignDay = totalSignDay;
          _log(maskedUid, regionName, `已签到${totalSignDay}天`, `今天${isSign ? '已签到' : '未签到'}`);
          return { totalSignDay, isSign };
        },
        e => _warn('获取签到状态失败，进行重试', e.toString()),
      );
    } catch (e: any) {
      _err(maskedUid, regionName, '获取签到状态失败', e.toString());
    }
  }

  async signIn(role: MGSRole, captcha?: { challenge: string; validate: string }) {
    const { region, game_uid: uid } = role;
    const act_id = mConsts[0];
    try {
      await retryAsync(
        async () => {
          const { data } = await this.axios.post<{
            retcode: number;
            message: string;
            data: { success: number; gt: string; challenge: string };
          }>(
            mConsts[10],
            { act_id, region, uid },
            {
              headers: {
                ds: ds(true),
                origin: mConsts[6],
                referer: `${mConsts[7]}${act_id}${mConsts[8]}`,
                ...(captcha
                  ? {
                      'x-rpc-challenge': captcha.challenge,
                      'x-rpc-validate': captcha.validate,
                      'x-rpc-seccode': `${captcha.validate}|jordan`,
                    }
                  : {}),
              },
            },
          );
          switch (data.retcode) {
            case 0:
              if (data.data.success !== 0) {
                if (dama.available && !captcha) {
                  if (this.applySavingMode && dama.savingModeAvailable) {
                    _log('出现验证码，节约模式生效，跳过');
                    return;
                  }
                  _log('出现验证码，尝试打码');
                  const { gt, challenge } = data.data;
                  const validate = await dama.gameCaptcha(gt, challenge, this.applySavingMode);
                  await this.signIn(role, { challenge, validate });
                  return;
                }
                _setFailed();
                _err('由于验证码，签到请求失败');
                break;
              }
              _log(`签到成功，获得【${this.award}}】`);
              break;
            case -5003:
              _warn(`签到失败：(${data.retcode})${data.message}`);
              return _warn;
            default:
              _setFailed();
              _err(`签到失败：(${data.retcode})${data.message}`);
              break;
          }
        },
        e => {
          if (e.applySavingMode) throw e;
          _warn('签到请求失败，进行重试', e.toString());
        },
      );
    } catch (e: any) {
      if (e.applySavingMode) {
        _log(e.toString());
        return;
      }
      _setFailed();
      _err('签到请求失败', e.toString());
    }
  }

  public static async fetchAwards() {
    try {
      return await retryAsync(
        async () => {
          const { data } = await Axios.get<{
            retcode: number;
            message: string;
            data: { awards: MGSAwards[] };
          }>(mConsts[26], { params: { act_id: mConsts[0] } });
          if (data.retcode !== 0) {
            _err(`获取签到奖励信息失败：(${data.retcode})${data.message}`);
            return;
          }
          this.awards = data.data.awards;
        },
        e => _warn('获取签到奖励信息失败，进行重试', e.toString()),
      );
    } catch (e: any) {
      _err('获取签到奖励信息失败', e.toString());
    }
  }
}
