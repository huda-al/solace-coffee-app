describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    // Page title changed. The page title is 'Cypress.io: Kitchen Sink'.
    cy.title().should('equal', 'Solace Coffee — Pesan Antar')
  })
})