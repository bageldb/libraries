import { type NuxtModule } from 'nuxt/schema';
import { defineNuxtModule, createResolver, addPlugin, addImports } from '@nuxt/kit'
import { defu } from 'defu'

// Module options TypeScript interface definition
export interface ModuleOptions {
  alias: string;
  token?: string;
  exposePublicClient?: boolean;
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'bageldb',
    configKey: 'BagelDB',
    compatibility: {
      bridge: true
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    alias: 'db'
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.bageldb = defu(nuxt.options.runtimeConfig.bageldb, {
      ...options
    })

    if (options.exposePublicClient) {
      nuxt.options.runtimeConfig.public.bageldb = defu(nuxt.options.runtimeConfig.bageldb, {
        ...options
      })
    }

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      // mode: 'server',
    })

    // Add auto imports
    const composables = resolver.resolve('./runtime/composables')
    addImports([{ from: composables, name: 'useBagelDB' }])
  }
})
export default module
