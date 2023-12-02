import { SR_ACT_ID, SR_BIZ, WEB_AWARDS_URL, WEB_IS_SIGN_URL, WEB_SIGN_URL } from '../config';
import { MBaseClient } from './base';
import type { MConfig } from './base';

export class MSRClient extends MBaseClient {
  protected config: MConfig = {
    biz: SR_BIZ,
    actId: SR_ACT_ID,
    keyAward: '星琼',
    awardsUrl: WEB_AWARDS_URL,
    isSignUrl: WEB_IS_SIGN_URL,
    signUrl: WEB_SIGN_URL,
  };
}
