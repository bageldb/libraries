export default defineNuxtConfig({
  // alias: {
  //   '@bageldb/bageldb-nuxt': import.meta.env.NUXT_ENV_BAGEL_NUXT_ALIAS
  //     ? '@bageldb/bageldb-nuxt/dist'
  //     : fileURLToPath(new URL('../src', import.meta.url))
  // },

  modules: [
    [
      '../src/module',
      { token: process.env.NUXT_ENV_BAGEL_TOKEN, exposePublicClient: true }
    ]
  ],


  devtools: { enabled: true }
})
