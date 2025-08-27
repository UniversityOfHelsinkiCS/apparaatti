describe('template spec', () => {
  it('passes', () => {
    cy.visit('/api/ping')
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('questions visible', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('[data-cy="question-title-2"]').should('include.text', 'Mikä on koulusivistyskielesi?');
    cy.get('[data-cy="question-title-3"]').should('include.text', 'Mistä kielestä haet kursseja?');
    cy.get('[data-cy="question-title-4"]').should('include.text', 'Olen suorittanut kielen tutkintoon kuuluvan kurssin jo aiemmin edellisissä opinnoissa.');
    cy.get('[data-cy="question-title-5"]').should('include.text', 'Mikä on haluamasi kurssin suoritusajankohta?');
    cy.get('[data-cy="question-title-6"]').should('include.text', 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1/B2).');
    cy.get('[data-cy="question-title-7"]').should('include.text', 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.');
    cy.get('[data-cy="question-title-8"]').should('include.text', 'Minulle kielenoppiminen on erityisen haasteellista ja se jännittää/pelottaa minua paljon');
    cy.get('[data-cy="question-title-9"]').should('include.text', 'Valmistutko lähiaikoina?');
    cy.get('[data-cy="question-title-10"]').should('include.text', 'Mikä on suosimasi opetusmuoto?');
    cy.get('[data-cy="question-title-11"]').should('include.text', 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.');
    cy.get('[data-cy="question-title-12"]').should('include.text', 'Haluan työskennellä itsenäisesti tai autonomisesti.');
    cy.get('[data-cy="question-title-13"]').should('include.text', 'Haluan osallistua kurssille, jonka aikataulu on joustava.');
    /* ==== End Cypress Studio ==== */
  });
})
