// -- This is a parent command --
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get("[data-cy=email-input]").type(email);
  cy.get("[data-cy=password-input]").type(password);
  cy.get("[data-cy=login-button]").click();
});

// Database commands for testing
Cypress.Commands.add("resetDatabase", () => {
  cy.task("resetDatabase");
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
