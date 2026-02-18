describe('API ping', () => {
  it('returns pong from /api/ping', () => {
    cy.request('/api/ping').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.eq('pong')
    })
  })
})
