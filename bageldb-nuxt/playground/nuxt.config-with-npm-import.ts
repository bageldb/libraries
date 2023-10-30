export default defineNuxtConfig({ 
  modules: [
    [
      '@bageldb/bageldb-nuxt',
      { token: process.env.NUXT_ENV_BAGEL_TOKEN, exposePublicClient: true }
    ]
  ],


  devtools: { enabled: true }
})
