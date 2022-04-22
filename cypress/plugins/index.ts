/// <reference types="cypress" />
const path = require('path')
const browserify = require('@cypress/browserify-preprocessor')
const cucumber = require('cypress-cucumber-preprocessor').default

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const cucumberOptions = {
    ...browserify.defaultOptions,
    typescript: require.resolve('typescript')
  }

  on('file:preprocessor', cucumber(cucumberOptions))

  return config
}
