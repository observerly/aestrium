import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps'

Given(/^the Sky Viewer app is visible$/, () => {
  cy.visit('/').get('[aria-label="All-Sky Star Observatory"]').as('skyViewer')
})

Then(/^I should see the stars$/, () => {
  cy.get('@skyViewer').should('be.visible')
})
