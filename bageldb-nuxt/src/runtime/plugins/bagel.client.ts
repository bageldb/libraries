import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import * as Axios from 'axios';


import BagelNuxt from '../bageldb-nuxt'

export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const ctx = runtimeConfig?.public?.bageldb || runtimeConfig?.bageldb

  // const _options = <%= JSON.stringify(options, null, 2) %>;


  const db = new BagelNuxt(ctx?.token, ctx, Axios.default)
  // nuxtApp.provide(ctx.alias, db)
  nuxtApp.vueApp.config.globalProperties.$db = db

  // nuxtApp.hook('vue:error', (error, instance, info) => {
  //   console.log('vue:error', { error, instance, info });
  // })

  // Inject $db
  return {
    provide: {
      [ctx?.alias || '$db']: db
    },
  }
})


