import { mConsts } from '../../utils/const';
import { MBaseClient } from './base';
import type { MConfig } from './base';

export class MSRClient extends MBaseClient {
  protected config: MConfig = {
    biz: mConsts[29],
    actId: mConsts[30],
    keyAward: mConsts[32],
    homeUrl: mConsts[31],
    isSignUrl: mConsts[33],
    signUrl: mConsts[34],
  };
}
