import { defineNuxtPlugin } from '#app';
// import { BagelDB } from '@bageldb/bagel-db';
// import { type InjectionKey } from 'vue';

// export const bagelInjectionKey = Symbol('bageldb') as InjectionKey<BagelDB>;

export default defineNuxtPlugin((nuxtApp) => {

  // const db = new BagelDB(import.meta.env.NUXT_ENV_BAGEL_TOKEN)

  // nuxtApp.vueApp.config.globalProperties.$db = db;
  // nuxtApp.vueApp.provide(bagelInjectionKey, db);

})
