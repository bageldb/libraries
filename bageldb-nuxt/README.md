# BagelDB Client for NuxtJS

BagelDB is a content management system with flexible database with user login

## Setup

- Install BagelDB-Nuxt in your project

```
npm i @bageldb/bageldb-nuxt
```

- Add Module to nuxtConfig.js

```js
  modules: [
    [
        '@bageldb/bageldb-nuxt',
        { token: process.env.NUXT_ENV_BAGEL_TOKEN, alias: "db"}]
  ],
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

if you call the instance via the `fetch()` method, use `this` before calling it

```js
export default {
  async fetch() {
    let { data: books } = await this.$db.collection("books").get();
    return { books };
  },
};
```

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
