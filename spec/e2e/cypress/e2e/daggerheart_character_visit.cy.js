import { clickBySelector, scrollToBySelector } from '../helpers/actions';

// spec/cypress/e2e/guest_visit.cy.js
describe('Daggerheart character visit', () => {
  it('visit dashboard with Daggerheart character', () => {
    cy.app('clean')
    cy.appFactories([
      ['create', 'user', { username: 'username', password: '12345qwert' } ]
    ])

    // Visit the application under test
    cy.visit('/')
    cy.contains('Interactive character sheets for any tabletop games in one place');
    clickBySelector('a[data-test-id="close-cookie-banner"]');
    clickBySelector('a[data-test-id="signin-link"]');

    scrollToBySelector('input[data-test-id="username-input"]').clear().type('username');
    scrollToBySelector('input[data-test-id="password-input"]').clear().type('12345qwert');
    clickBySelector('input[data-test-id="signin-button"]');

    clickBySelector('p[dataTestId="new-character-button"]');
    clickBySelector('div[dataTestId="new-character-platform-select"]');
    clickBySelector('div[dataTestId="new-character-platform-select"] ul li:nth-of-type(3)');

    scrollToBySelector('input[dataTestId="character-name-input"]').clear().type('Duggy');

    clickBySelector('div[dataTestId="character-ancestry-select"]');
    clickBySelector('div[dataTestId="character-ancestry-select"] ul li:nth-of-type(3)');

    clickBySelector('div[dataTestId="character-community-select"]');
    clickBySelector('div[dataTestId="character-community-select"] ul li:nth-of-type(1)');

    clickBySelector('div[dataTestId="character-class-select"]');
    clickBySelector('div[dataTestId="character-class-select"] ul li:nth-of-type(2)');

    clickBySelector('div[dataTestId="character-subclass-select"]');
    clickBySelector('div[dataTestId="character-subclass-select"] ul li:nth-of-type(1)');

    clickBySelector('div[dataTestId="character-skip-guide-checkbox"]');
    clickBySelector('p[dataTestId="character-save-button"]');

    clickBySelector('.character-item:nth-of-type(1)');
  })
})
