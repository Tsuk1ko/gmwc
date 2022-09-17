import * as Actions from '@actions/core';

const isCI = !!process.env.CI;

export const _log = console.log;
export const _warn = isCI ? (...data: any[]) => Actions.warning(data.join(' ')) : console.warn;
export const _err = isCI ? (...data: any[]) => Actions.error(data.join(' ')) : console.error;

let isFailed = false;

export const _setFailed = () => {
  if (isFailed) return;
  Actions.setFailed('failed');
  isFailed = true;
};

export const _isFailed = () => isFailed;
