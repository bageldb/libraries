// import { fileURLToPath } from "url";

export default defineNuxtConfig({
  // alias: {
  //   '@bageldb/bageldb-nuxt': import.meta.env.NUXT_ENV_BAGEL_NUXT_ALIAS
  //     ? '@bageldb/bageldb-nuxt/dist'
  //     : fileURLToPath(new URL('../src', import.meta.url))
  // },

  modules: [
    '@nuxt/ui',

    [
      '../src/module',
      // '@bageldb/bageldb-nuxt',
      { token: process.env.NUXT_ENV_BAGEL_TOKEN, exposePublicClient: true }
    ]
  ],


  devtools: { enabled: true }
})
