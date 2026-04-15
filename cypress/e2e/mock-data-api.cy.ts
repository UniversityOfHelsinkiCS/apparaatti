/// <reference types="cypress" />

describe('API basic checks with seeded mock data', () => {
  it('returns pong from /api/ping', () => {
    cy.request('/api/ping').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.eq('pong')
    })
  })

  it('returns a mock user from /api/user', () => {
    cy.request('/api/user').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.username).to.eq('hy-hlo-testuser')
      expect(response.body.isAdmin).to.eq(true)
    })
  })

  it('returns studydata response for the mock user', () => {
    cy.request('/api/user/studydata').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('studyPhaseName')
      expect(response.body.studyPhaseName).to.have.property('fi')
    })
  })

  it('returns all seeded organisations from /api/organisations', () => {
    cy.request('/api/organisations').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.eq(17)

      const organisationCodes = response.body.map((org: any) => org.code)
      expect(organisationCodes).to.include('H930')
      expect(organisationCodes).to.include('H50')
    })
  })

  it('returns supported organisations subset from /api/organisations/supported', () => {
    cy.request('/api/organisations/supported').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.eq(16)

      const organisationCodes = response.body.map((org: any) => org.code)
      expect(organisationCodes).to.include('H50')
      expect(organisationCodes).to.not.include('H930')
    })
  })

  it('returns 400 from /api/admin/users without search parameter', () => {
    cy.request({
      url: '/api/admin/users',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.include('Search string must be provided')
    })
  })

  it('returns 400 from /api/admin/users when search is too short', () => {
    cy.request({
      url: '/api/admin/users?search=test',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.include('at least 5 characters long')
    })
  })

  it('returns users from /api/admin/users with a valid search', () => {
    cy.request('/api/admin/users?search=Testi%20Kayttaja').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.be.greaterThan(0)

      const usernames = response.body.map((user: any) => user.username)
      expect(usernames).to.include('hy-hlo-testuser')
    })
  })

  it('accepts only mandatory answers for Matemaattis-luonnontieteellinen faculty', () => {
    cy.visit('/')

    cy.get('[data-cy="study-field-select"]').should('be.visible').click()
    cy.get('li[data-value="H50"]').click()

    cy.get('[data-cy="primary-language-option-fi"]').click()
    cy.get('[data-cy="lang-option-fi"]').click()
    cy.get('[data-cy="primary-language-specification-option-writtenAndSpoken"]')
      .should('be.visible')
      .click()

    // Verify recommendations are rendered to the DOM as course links.
    cy.get('a[href*="studies.helsinki.fi/kurssit/toteutus/"]', { timeout: 15000 })
      .its('length')
      .should('be.greaterThan', 0)
  })

  it('returns login failed response from /api/fail', () => {
    cy.request('/api/fail').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq('Login failed')
    })
  })

  it('returns 404 for an unknown /api route', () => {
    cy.request({
      url: '/api/this-route-does-not-exist',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })
})