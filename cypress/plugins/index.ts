/// <reference types="cypress" />
const path = require('path')
const { startDevServer } = require('@cypress/vite-dev-server')
const browserify = require('@cypress/browserify-preprocessor')
const cucumber = require('cypress-cucumber-preprocessor').default

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const options = {
    ...browserify.defaultOptions,
    typescript: require.resolve('typescript')
  }

  on('file:preprocessor', cucumber(options))

  on('dev-server:start', options => {
    return startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(__dirname, '..', '..', 'vite.config.ts')
      }
    })
  })

  return config
}
