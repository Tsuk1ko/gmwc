export const WEB_CLIENT_TYPE = '5';
export const BBS_CLIENT_TYPE = '2';
export const APP_VERSION = '2.62.2';
export const DEFAULT_UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`;

export const WEB_SALT = '0wr0OpH2BNuekYrfeRwkiDdshvt10cTY';
export const BBS_SALT = 'pIlzNr5SAZhdnFW8ZxauW8UlxRdZc45r';
export const BBS_SALT_2 = 't0qEgfub6cvueAPgR5m9aQWWVciEer7v';

export const WEB_API_BASE = 'https://api-takumi.mihoyo.com';
export const BBS_API_BASE = 'https://bbs-api.miyoushe.com';

export const WEB_SIGN_URL = `${WEB_API_BASE}/event/luna/sign`;
export const WEB_AWARDS_URL = `${WEB_API_BASE}/event/luna/home?lang=zh-cn`;
export const WEB_ROLES_URL = `${WEB_API_BASE}/binding/api/getUserGameRolesByCookie`;
export const WEB_IS_SIGN_URL = `${WEB_API_BASE}/event/luna/info?lang=lang=zh-cn`;

export const BBS_TASK_LIST_URL = `${BBS_API_BASE}/apihub/sapi/getUserMissionsState`;
export const BBS_SIGN_URL = `${BBS_API_BASE}/apihub/app/api/signIn`;
export const BBS_POST_LIST_URL = `${BBS_API_BASE}/post/api/getForumPostList`;
export const BBS_VIEW_POST_URL = `${BBS_API_BASE}/post/api/getPostFull`;
export const BBS_LIKE_POST_URL = `${BBS_API_BASE}/apihub/sapi/upvotePost`;
export const BBS_SHARE_POST_URL = `${BBS_API_BASE}/apihub/api/getShareConf`;
export const BBS_POST_LIST_URL_OLD = 'https://bbs-api.mihoyo.com/post/wapi/getForumPostList';

export const WEB_CAPTCHA_REFERER = 'https://passport-api.mihoyo.com/account/ma-cn-passport/app/loginByPassword';
export const BBS_CAPTCHA_REFERER = 'https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html';

export const GS_BIZ = 'hk4e_cn';
export const GS_ACT_ID = 'e202311201442471';

export const SR_BIZ = 'hkrpg_cn';
export const SR_ACT_ID = 'e202304121516551';
