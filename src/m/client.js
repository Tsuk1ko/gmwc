const { _log, _warn, _err } = require('../utils/log');
const _ = require('lodash');
const { decode } = require('js-base64');
const dvid = require('./dvid');
const ds = require('./ds');
const retryPromise = require('../utils/retryPromise');

const act_id = decode('ZTIwMjAwOTI5MTEzOTUwMQ==');

const maskUid = uid => uid.substr(-3).padStart(uid.length, '*');

module.exports = class MClient {
  constructor(cookie) {
    this.axios = require('axios').default.create({
      timeout: 10000,
      baseURL: decode('aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20v'),
      headers: {
        [decode('eC1ycGMtZGV2aWNlX2lk')]: dvid(),
        [decode('eC1ycGMtY2xpZW50X3R5cGU=')]: '5',
        [decode('eC1ycGMtYXBwX3ZlcnNpb24=')]: '2.3.0',
        'user-agent': decode(
          'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxNF8yXzEgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBtaUhvWW9CQlMvMi4zLjA=',
        ),
        origin: decode('aHR0cHM6Ly93ZWJzdGF0aWMubWlob3lvLmNvbQ=='),
        referer: `${decode(
          'aHR0cHM6Ly93ZWJzdGF0aWMubWlob3lvLmNvbS9iYnMvZXZlbnQvc2lnbmluLXlzL2luZGV4Lmh0bWw/YmJzX2F1dGhfcmVxdWlyZWQ9dHJ1ZSZhY3RfaWQ9',
        )}${act_id}${decode('JnV0bV9zb3VyY2U9YmJzJnV0bV9tZWRpdW09bXlzJnV0bV9jYW1wYWlnbj1pY29u')}`,
        cookie,
      },
    });
  }

  getRoles() {
    return retryPromise(
      () =>
        this.axios
          .get(decode('L2JpbmRpbmcvYXBpL2dldFVzZXJHYW1lUm9sZXNCeUNvb2tpZT9nYW1lX2Jpej1oazRlX2Nu'))
          .then(({ data }) => {
            const list = _.get(data, 'data.list');
            if (!list) {
              global.failed = true;
              _err(JSON.stringify(data));
              return;
            }
            return list;
          }),
      e => _warn('角色信息请求失败，进行重试', e.toString()),
    ).catch(e => {
      global.failed = true;
      _err('角色信息请求失败', e.toString());
      return [];
    });
  }

  checkin({ region, game_uid: uid, region_name }) {
    return retryPromise(
      () =>
        this.axios
          .post(decode('L2V2ZW50L2Jic19zaWduX3Jld2FyZC9zaWdu'), { act_id, region, uid }, { headers: { ds: ds() } })
          .then(({ data }) => {
            (() => {
              switch (data.retcode) {
                case 0:
                  return _log;
                case -5003:
                  return _warn;
                default:
                  global.failed = true;
                  return _err;
              }
            })()(maskUid(uid), region_name, JSON.stringify(data));
          }),
      e => _warn('C 请求失败，进行重试', e.toString()),
    ).catch(e => {
      global.failed = true;
      _err(maskUid(uid), region_name, 'C 请求失败', e.toString());
    });
  }
};
