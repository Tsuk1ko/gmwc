import { WEB_AWARDS_URL, GS_ACT_ID, GS_BIZ, WEB_IS_SIGN_URL, WEB_SIGN_URL } from '../config';
import { MBaseClient } from './base';
import type { MConfig } from './base';

export class MGSClient extends MBaseClient {
  protected config: MConfig = {
    biz: GS_BIZ,
    actId: GS_ACT_ID,
    keyAward: '原石',
    awardsUrl: WEB_AWARDS_URL,
    isSignUrl: WEB_IS_SIGN_URL,
    signUrl: WEB_SIGN_URL,
    headers: {
      'x-rpc-signgame': 'hk4e',
    },
  };
}
