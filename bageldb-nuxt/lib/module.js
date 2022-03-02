import { resolve } from 'path';

export default async function module(moduleOptions) {
    const defaults = {
        alias: 'db'
    }
    const options = Object.assign({}, defaults, moduleOptions)

    this.addPlugin({
        src: resolve(__dirname, './templates/bageldb-nuxt.js'),
        fileName: 'bageldb-nuxt.js',
        options
    })
}
