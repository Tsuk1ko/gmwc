const HttpsProxyAgent = require('https-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');

module.exports = proxy => {
  if (typeof proxy !== 'string') return null;
  if (proxy.startsWith('http://') || proxy.startsWith('https://')) return new HttpsProxyAgent(proxy);
  if (proxy.startsWith('socks://')) return new SocksProxyAgent(proxy, true);
  return null;
};
