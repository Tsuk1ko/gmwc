export const _log = console.log;
export const _warn = console.warn;
export const _err = console.error;

let isFailed = false;

export const _setFailed = () => {
  if (isFailed) return;
  isFailed = true;
};

export const _isFailed = () => isFailed;
