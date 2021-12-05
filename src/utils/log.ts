import * as Actions from '@actions/core';

const isCI = !!process.env.CI;

export const _log = console.log;
export const _warn = isCI ? (...data: any[]) => Actions.warning(data.join(' ')) : console.warn;
export const _err = isCI ? (...data: any[]) => Actions.error(data.join(' ')) : console.error;
export const _setFailed = () => {
  process.exitCode = 1;
};
