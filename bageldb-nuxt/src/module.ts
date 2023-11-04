import { type NuxtModule } from 'nuxt/schema';
import { defineNuxtModule, createResolver, addPlugin, addImports } from '@nuxt/kit'
import { defu } from 'defu'
import { fileURLToPath } from 'url';

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
    const {resolve} = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.bageldb = defu(nuxt.options.runtimeConfig.bageldb, {
      ...options
    })

    if (options.exposePublicClient) {
      nuxt.options.runtimeConfig.public.bageldb = defu(nuxt.options.runtimeConfig.bageldb, {
        ...options
      })
    }


    // Transpile runtime
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve(runtimeDir, 'plugins', 'bagel.client'))
    addPlugin(resolve(runtimeDir, 'plugins', 'bagel.server'))

    // Add auto imports
    const composables = resolve('./runtime/composables')
    addImports([{ from: composables, name: 'useBagelDB' }])
  }
})
export default module
