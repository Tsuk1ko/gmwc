const Actions = require('@actions/core');

const CI = {
  _log: console.log,
  _warn: (...data) => Actions.warning(data.join(' ')),
  _err: (...data) => Actions.error(data.join(' ')),
  _setFailed: Actions.setFailed,
};

const PC = {
  _log: console.log,
  _warn: console.warn,
  _err: console.error,
  _setFailed: () => {
    process.exitCode = 1;
  },
};

module.exports = process.env.CI ? CI : PC;
