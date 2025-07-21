describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('can navigate to results and back', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('localhost:3000');
    cy.get('.css-o13ras > .MuiButton-root').click();
    cy.get('.css-nen11g-MuiStack-root > .MuiButtonBase-root').click();
    cy.get('#study-field-select-label').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('can logout', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('localhost:3000');
    cy.get('[data-testid="MenuIcon"] > path').click();
    cy.get('.MuiPaper-root > .MuiBox-root > .MuiStack-root > .MuiTypography-root > .MuiButtonBase-root').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('previus experience info shows', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('localhost:3000');
    cy.get('.css-1iw3t7y-MuiFormControl-root > :nth-child(2) > .MuiFormGroup-root > :nth-child(2)').click();
    cy.get('.css-1iw3t7y-MuiFormControl-root > :nth-child(2) > .MuiFormGroup-root > :nth-child(2) > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
    cy.get(':nth-child(3) > .MuiFormGroup-root > :nth-child(2)').click();
    cy.get(':nth-child(3) > .MuiFormGroup-root > :nth-child(2) > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
    cy.get(':nth-child(4) > .MuiFormGroup-root > :nth-child(1)').click();
    cy.get(':nth-child(4) > .MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
    cy.get('.MuiAccordionSummary-content > .MuiTypography-root').click();
    cy.get('.MuiAccordionSummary-content').click();
    cy.get('.MuiAccordionDetails-root').click();
    cy.get('.MuiAccordionDetails-root > .MuiTypography-root').should('have.text', 'Katso ohjeet hyväksilukemiseen täältä');
    /* ==== End Cypress Studio ==== */
  });
})