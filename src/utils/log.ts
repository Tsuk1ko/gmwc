import { warning, error, setFailed } from '@actions/core';

const isCI = !!process.env.CI;

export const _log = console.log;
export const _warn = isCI ? (...data: any[]) => warning(data.join(' ')) : console.warn;
export const _err = isCI ? (...data: any[]) => error(data.join(' ')) : console.error;

let isFailed = false;

export const _setFailed = () => {
  if (isFailed) return;
  setFailed('');
  isFailed = true;
};

export const _isFailed = () => isFailed;
