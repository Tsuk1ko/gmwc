const md5 = require('md5');
const { generate } = require('randomstring');
const { stringify } = require('qs');
const { decode } = require('js-base64');

const salt = decode('aDh3NTgyd3h3Z3F2YWhjZGtwdmRoYmgydzljYXNnZmw=');

module.exports = () => {
  const t = Math.floor(Date.now() / 1000);
  const r = generate({ length: 6, charset: 'abcdefghijklmnopqrstuvwxyz0123456789' });
  const m = md5(stringify({ salt, t, r }));
  return [t, r, m].join(',');
};
