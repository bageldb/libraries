# BagelDB Client for NuxtJS

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

BagelDB is a content management system with flexible database with user login for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/bageldb/libraries/tree/main/bageldb-nuxt?file=playground%2Fapp.vue,playground%2Fnuxt.config.ts,playground%2FREADME.md)
<!-- - [📖 &nbsp;Documentation](https://docs.bageldb.com) -->

## Features

- ⛰ &nbsp; Flexible Database
- 🚠 &nbsp; Simplicity First
- 🌲 &nbsp; Powerful Editor Tools

## Quick Setup

1. Add `@bageldb/bageldb-nuxt` dependency to your project

```bash
# Using pnpm
pnpm add @bageldb/bageldb-nuxt

# Using yarn
yarn add @bageldb/bageldb-nuxt

# Using npm
npm i @bageldb/bageldb-nuxt

# Using bun
bun i @bageldb/bageldb-nuxt
```

2. Add `@bageldb/bageldb-nuxt` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@bageldb/bageldb-nuxt',
    {
      token: process.env.NUXT_ENV_BAGEL_TOKEN,
      alias: "db", // (optional)
      exposePublicClient: true // (optional) - this will expose the client to the browser
    }
  ]
})
```

The default alias is `$db` but can be set easily in the import. Two instances can be used in one project, but they must have different instances.

** in older versions it used to default to `$bageldb`

## Use It

The db instance can be accessed globally anywhere in the code

retreive it via the context:

```js
export default {
  async asyncData({ $db }) {
    let { data: books } = await $db.collection("books").get();
    return { books };
  },
};
```
<!--
if you call the instance via the `fetch()` method, use `this` before calling it

```js
export default {
  async fetch() {
    let { data: books } = await this.$db.collection("books").get();
    return { books };
  },
};
``` -->

## Authentication

Using Auth with Nuxt.js works the same as evey BagelDB js framework, by using the `users()` method.

```js
export default {
  methods: {
    async login(email, password) {
      await this.$db.users().validate(email, password);
    },
    async logout() {
      await this.$db.users().logout();
    },
    async signUp(email, password, userName) {
      let userID = await this.$db
        .users()
        .create(email, password)
        .catch(console.log);
      // create an item with the user's id to store more information about the user.
      await this.$db.collection("users").item(userID).set({ email, userName });
    },
  },
};
```

every call made after that will use the Auth token stored in the cookie.


That's it! You can now use BagelNuxt in your Nuxt app ✨


## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@bageldb/bageldb-nuxt/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@bageldb/bageldb-nuxt

[npm-downloads-src]: https://img.shields.io/npm/dm/@bageldb/bageldb-nuxt.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@bageldb/bageldb-nuxt

[license-src]: https://img.shields.io/npm/l/@bageldb/bageldb-nuxt.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@bageldb/bageldb-nuxt

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
