import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export const getAgent = (proxy: any) => {
  if (typeof proxy !== 'string') return null;
  if (proxy.startsWith('http://') || proxy.startsWith('https://')) return new HttpsProxyAgent(proxy);
  if (proxy.startsWith('socks://')) return new SocksProxyAgent(proxy);
  return null;
};
