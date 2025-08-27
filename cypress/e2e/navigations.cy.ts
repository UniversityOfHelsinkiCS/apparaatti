describe('template spec', () => {
  const headers= {
            'accept': 'application/json, text/plain, */*',
            'user-agent': 'axios/0.27.2'
  }
  it('passes', () => {

    console.log("frontend ping")
    cy.visit('/', {headers})
    cy.visit('/api/ping', {headers})
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('can navigate to results and back', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('[data-cy=submit-form]').click();
    cy.get('[data-cy=back-to-form]').click();
    cy.get('[data-cy=study-field-select]').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('can logout', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('[data-testid="MenuIcon"] > path').click();
    cy.get('.MuiPaper-root > .MuiBox-root > .MuiStack-root > .MuiTypography-root > .MuiButtonBase-root').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('previus experience info shows', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('[data-cy="primary-language-option-sv"]').click();
    cy.get('[data-cy="primary-language-option-sv"] input').check();
    cy.get('[data-cy="lang-1-option-sv"]').click();
    cy.get('[data-cy="lang-1-option-sv"] input').check();
    cy.get('[data-cy="primary-language-specification-option-writtenAndSpoken"]').click();
    cy.get('[data-cy="primary-language-specification-option-writtenAndSpoken"] input').check();
    cy.contains('Katso ohjeet hyväksilukemiseen').should('be.visible')    /* ==== End Cypress Studio ==== */
  });
})
