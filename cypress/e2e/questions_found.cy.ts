describe('template spec', () => {
  it('passes', () => {
    cy.visit('/api/ping')
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('questions visible', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get(':nth-child(2) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(2) > .MuiStack-root').click();
    cy.get(':nth-child(2) > .MuiStack-root').should('have.text', 'Mikä on koulusivistyskielesi?');
    cy.get(':nth-child(3) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(3) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(3) > .MuiStack-root').click();
    cy.get(':nth-child(3) > .MuiStack-root').should('have.text', 'Mistä kielestä haet kursseja?');
    cy.get('.css-1iw3t7y-MuiFormControl-root > :nth-child(4) > .MuiStack-root').click();
    cy.get('.css-1iw3t7y-MuiFormControl-root > :nth-child(4) > .MuiStack-root').should('have.text', 'Olen suorittanut kielen tutkintoon kuuluvan kurssin jo aiemmin edellisissä opinnoissa.');
    cy.get(':nth-child(5) > .MuiStack-root').click();
    cy.get(':nth-child(5) > .MuiStack-root').should('have.text', 'Mikä on haluamasi kurssin suoritusajankohta?');
    cy.get(':nth-child(6) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(6) > .MuiStack-root > .MuiTypography-root').should('have.text', 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1/B2).');
    cy.get(':nth-child(7) > .MuiStack-root').click();
    cy.get(':nth-child(7) > .MuiStack-root').should('have.text', 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.');
    cy.get(':nth-child(8) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(8) > .MuiStack-root > .MuiTypography-root').should('have.text', 'Minulle kielenoppiminen on erityisen haasteellista ja se jännittää/pelottaa minua paljon');
    cy.get(':nth-child(9) > .MuiStack-root').click();
    cy.get(':nth-child(9) > .MuiStack-root').should('have.text', 'Valmistutko lähiaikoina?');
    cy.get(':nth-child(10) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(10) > .MuiStack-root').click();
    cy.get(':nth-child(10) > .MuiStack-root').should('have.text', 'Mikä on suosimasi opetusmuoto?');
    cy.get(':nth-child(11) > .MuiStack-root > .MuiTypography-root').click();
    cy.get(':nth-child(11) > .MuiStack-root > .MuiTypography-root').should('have.text', 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.');
    cy.get(':nth-child(12) > .MuiStack-root').click();
    cy.get(':nth-child(12) > .MuiStack-root').should('have.text', 'Haluan työskennellä itsenäisesti tai autonomisesti.');
    cy.get(':nth-child(13) > .MuiStack-root').click();
    cy.get(':nth-child(13) > .MuiStack-root').should('have.text', 'Haluan osallistua kurssille, jonka aikataulu on joustava.');
    /* ==== End Cypress Studio ==== */
  });
})
