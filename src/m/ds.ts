import md5 from 'md5';
import { generate } from 'randomstring';
import { stringify } from 'qs';
import { mConsts } from '../utils/const';

export const ds = (web = false): string => {
  const salt = web ? mConsts[12] : mConsts[11];
  const t = Math.floor(Date.now() / 1000);
  const r = generate({ length: 6, charset: 'abcdefghijklmnopqrstuvwxyz0123456789' });
  const m = md5(stringify({ salt, t, r }));
  return [t, r, m].join(',');
};

export const coinDs = (data: Record<string, any>): string => {
  const salt = mConsts[20];
  const t = Math.floor(Date.now() / 1000);
  const r = generate({ length: 6, charset: 'abcdefghijklmnopqrstuvwxyz0123456789' });
  const m = md5(`${stringify({ salt, t, r })}&b=${JSON.stringify(data)}&q=`);
  return [t, r, m].join(',');
};
