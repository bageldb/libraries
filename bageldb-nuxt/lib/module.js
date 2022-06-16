


const resolve = require('path').resolve;
module.exports = async function module(moduleOptions) {
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

// REQUIRED if publishing the module as npm package
module.exports.meta = require('../package.json')
