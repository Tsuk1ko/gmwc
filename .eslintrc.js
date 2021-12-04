const offTsRules = [
  'strict-boolean-expressions',
  'prefer-nullish-coalescing',
  'no-non-null-assertion',
  'promise-function-async',
  'explicit-function-return-type',
  'no-floating-promises',
  'no-misused-promises',
  'naming-convention',
];

module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['standard-ts', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: Object.fromEntries(offTsRules.map(name => [`@typescript-eslint/${name}`, 'off'])),
};
