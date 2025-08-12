describe('template spec', () => {
  const headers= {
            'accept': 'application/json, text/plain, */*',
            'user-agent': 'axios/0.27.2'
  }
     beforeEach(() => {
      cy.session('user-session', () => {
        console.log("backend ping")
        cy.visit('http://host.docker.internal:8000/api/ping')

        console.log("frontend ping")
        cy.visit('http://host.docker.internal:3000', { headers })

        console.log("frontend front page")
        cy.visit('/', {headers})
        console.log("frontend proxy route to backend")
        cy.visit('/api/ping', {headers})
      })
  })

  it('passes', () => {
    cy.visit('/api/ping', {headers})
    cy.visit('/', {headers})
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('can navigate to results and back', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('.css-o13ras > .MuiButton-root').click();
    cy.get('.css-nen11g-MuiStack-root > .MuiButtonBase-root').click();
    cy.get('#study-field-select-label').click();
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
