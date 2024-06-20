export const md5 = (msg: string) => {
  const hasher = new Bun.CryptoHasher('md5');
  hasher.update(msg);
  return hasher.digest('hex');
};
