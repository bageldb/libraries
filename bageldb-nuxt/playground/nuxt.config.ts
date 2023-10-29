export default defineNuxtConfig({
  modules: [
    [
      '../src/module',
      { token: process.env.NUXT_ENV_BAGEL_TOKEN, exposePublicClient: true }
    ]
  ],


  devtools: { enabled: true }
})
