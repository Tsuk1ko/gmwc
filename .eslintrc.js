const offTsRules = [
  'strict-boolean-expressions',
  'prefer-nullish-coalescing',
  'no-non-null-assertion',
  'promise-function-async',
  'explicit-function-return-type',
  'no-floating-promises',
  'no-misused-promises',
  'naming-convention',
  'no-confusing-void-expression',
  'no-explicit-any',
  'ban-types',
  'class-literal-property-style',
  'unbound-method',
];

module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'love',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: ['tsconfig.json'],
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    ...Object.fromEntries(offTsRules.map(name => [`@typescript-eslint/${name}`, 'off'])),
    'import/order': ['warn', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'] }],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
      },
    ],
  },
};
