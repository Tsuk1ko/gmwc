const sleep = require('./sleep');

/**
 * Retry Promise
 *
 * @param {() => Promise} fn
 * @param {(e: Error) => any} [onError]
 * @param {number} [retry]
 */
const retryPromise = (fn, onError = () => {}, retry = 9) =>
  fn().catch(async e => {
    if (retry <= 0) throw e;
    onError(e);
    await sleep(3000);
    return retryPromise(fn, onError, retry - 1);
  });

module.exports = retryPromise;
