export const maskId = (uid: string | number, len = 3) => {
  uid = String(uid);
  return uid.substr(-len).padStart(uid.length, '*');
};
