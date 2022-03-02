
import BagelNuxt from '@bageldb/bageldb-nuxt/lib/bageldb-nuxt.js'

export default (options, inject) => {
    let ctx = options
    const _options = <%= JSON.stringify(options, null, 2) %>;

    const db = new BagelNuxt(_options.token, ctx)
    inject(_options.alias || 'bageldb', db)
}