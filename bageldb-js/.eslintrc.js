module.exports = {
  parserOptions: {
    extraFileExtensions: ['.js'],
    parser: '@typescript-eslint/parser',
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allow
  },
  // parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    "test/**/*",
    "dist/**/*",
    "src/**/*.spec.ts",
    ".eslintrc.js",
    "unwrap.js",
    "node.js",
    // "webpack.config.js"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": 1,
    "no-debugger": 1,
    "prettier/prettier": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-this-alias": 1,
    "@typescript-eslint/no-var-requires": 1,
    "@typescript-eslint/ban-types": 1,
  },
};
