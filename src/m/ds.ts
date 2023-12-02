import md5 from 'md5';
import { generate } from 'randomstring';
import { stringify } from 'qs';
import { BBS_SALT, BBS_SALT_2, WEB_SALT } from './config';

const randStr = () => generate({ length: 6, charset: 'abcdefghijklmnopqrstuvwxyz0123456789' });

export const ds = (web = false): string => {
  const salt = web ? WEB_SALT : BBS_SALT;
  const t = Math.floor(Date.now() / 1000);
  const r = randStr();
  const m = md5(stringify({ salt, t, r }));
  return [t, r, m].join(',');
};

export const ds2 = (data: Record<string, any>): string => {
  const salt = BBS_SALT_2;
  const t = Math.floor(Date.now() / 1000);
  const r = randStr();
  const m = md5(`${stringify({ salt, t, r })}&b=${JSON.stringify(data)}&q=`);
  return [t, r, m].join(',');
};
