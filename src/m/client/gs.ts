import { mConsts } from '../../utils/const';
import { MBaseClient, MConfig } from './base';

export class MGSClient extends MBaseClient {
  protected config: MConfig = {
    biz: mConsts[27],
    actId: mConsts[0],
    keyAward: mConsts[28],
    homeUrl: mConsts[26],
    isSignUrl: mConsts[25],
    signUrl: mConsts[10],
  };
}
