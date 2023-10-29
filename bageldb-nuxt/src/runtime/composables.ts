import { useNuxtApp } from '#app'
import type BagelNuxt from './bageldb-nuxt';

export const useBagelDB = (alias = '') => useNuxtApp()[alias || '$db'] as BagelNuxt
