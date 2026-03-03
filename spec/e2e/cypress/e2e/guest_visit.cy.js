import { clickBySelector } from '../helpers/actions';

// spec/cypress/e2e/guest_visit.cy.js
describe('Guest visit', () => {
  it('visit main pages as guest', () => {
    // Visit the application under test
    cy.visit('/')
    cy.contains('Interactive character sheets for any tabletop games in one place')
    cy.contains('Cookie banner')

    // visiting main page after closing cookie banner
    clickBySelector('a[data-test-id="close-cookie-banner"]')
    cy.visit('/')
    cy.contains('Cookie banner').should('not.exist')

    // visit privacy policy page
    clickBySelector('a[data-test-id="footer-privacy-link"]')
    cy.contains('Privacy policy')

    // visit unauthorized page
    cy.visit('/dashboard')
    cy.contains('Interactive character sheets for any tabletop games in one place')

    // visit unexisting page
    cy.visit('/unexisting', { failOnStatusCode: false })
    cy.contains('Object is not found')
  })
})
