const ignorePattern = [
  'mutable',
  'self',
  'local',
  'Global',
  'modifiable',
  'writable',
];
const ignoreAccessorPattern = [
  '**.mutable*.**',
  '**.modifiable*.**',
  '**.writable*.**',
  'Global.**',
];

module.exports = {
  extends: [
    // 'erb',
    'plugin:react/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'immutable',
    '@typescript-eslint',
    'prettier',
    'sort-imports-es6-autofix',
    'functional',
    'import',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    // Import
    'import/no-extraneous-dependencies': 'off',
    'import/no-duplicates': ['warn', { considerQueryString: true }],
    'import/newline-after-import': 'warn',

    // Syntax
    curly: 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    'react/display-name': 'off',

    // ESLint
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'off',
    'sort-imports-es6-autofix/sort-imports-es6': [
      1,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    'promise/always-return': 'off',
    'prettier/prettier': ['warn'],
    'react/prop-types': 'off',

    // Sorting
    '@typescript-eslint/member-ordering': [
      'warn',
      {
        classes: [
          'static-field',
          'private-instance-field',
          'constructor',
          'static-method',
          'public-instance-method',
          'private-instance-method',
        ],
      },
    ],
    'react/sort-comp': [
      'warn',
      {
        order: [
          'static-variables',
          'static-methods',
          'instance-variables',
          'lifecycle',
          'render',
          'everything-else',
        ],
        groups: {
          lifecycle: [
            'constructor',
            'state',
            'getDerivedStateFromProps',
            'componentDidMount',
            'shouldComponentUpdate',
            'componentDidUpdate',
            'componentWillUnmount',
            'render',
          ],
        },
      },
    ],

    // Immutable
    'functional/prefer-readonly-type': [
      'warn',
      {
        ignoreClass: true,
        ignoreCollections: true,
        allowLocalMutation: true,
        ignorePattern,
      },
    ],
    'functional/immutable-data': [
      'warn',
      {
        ignoreImmediateMutation: true,
        ignorePattern,
        ignoreAccessorPattern,
      },
    ],
    'functional/no-method-signature': 'warn',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./config/webpack.config.dev.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    react: {
      createClass: 'createReactClass', // Regex for Component Factory to use,
      // default to "createReactClass"
      pragma: 'React', // Pragma to use, default to "React"
      fragment: 'Fragment', // Fragment to use (may be a property of <pragma>), default to "Fragment"
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
};
