/// <reference types="cypress" />
const path = require('path')
const { startDevServer } = require('@cypress/vite-dev-server')

const cucumber = require('cypress-cucumber-preprocessor').default

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('file:preprocessor', cucumber())

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
