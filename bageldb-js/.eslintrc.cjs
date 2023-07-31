module.exports = process?.env?.LOCAL_LINK
  ? {}
  : {
      parserOptions: {
        // extraFileExtensions: ['.cjs'],
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allow
      },
      // parser: "@typescript-eslint/parser", parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'airbnb-typescript',
        // "prettier"
      ],
      root: true,
      env: {
        node: true,
        jest: true,
      },
      ignorePatterns: [
        'test/**/*',
        'dist/**/*',
        'src/**/*.spec.ts',
        '.eslintrc.cjs',
        'unwrap.js',
        'unwrap.cjs',
        'node.js',
        'src/**/*.d.ts',
        'webpack.config.js',
        'webpack.config.cjs',
      ],
      rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-useless-catch': 0,
        'prettier/prettier': 0,
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        'react/jsx-filename-extension': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        'no-console': 1,
        'no-debugger': 1,
        '@typescript-eslint/no-this-alias': 1,
        '@typescript-eslint/no-var-requires': 1,
        '@typescript-eslint/ban-types': 1,
        '@typescript-eslint/naming-convention': 1,
      },
    };
