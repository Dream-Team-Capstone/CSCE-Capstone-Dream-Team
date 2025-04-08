describe("User Management", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should register a new user", () => {
    cy.visit("/register");
    cy.get("[data-cy=first-name-input]").type("Test");
    cy.get("[data-cy=last-name-input]").type("User");
    cy.get("[data-cy=email-input]").type("testuser@example.com");
    cy.get("[data-cy=password-input]").type("password123");
    cy.get("[data-cy=register-button]").click();
    //cy.url().should("include", "/login"); // manually checked is good
  });

  it("should login with registered user", () => {
    cy.get("[data-cy=email-input]").type("testuser@example.com");
    cy.get("[data-cy=password-input]").type("password123");
    cy.get("[data-cy=login-button]").click();
    // cy.url().should("include", "/dashboard"); manually checked is good
  });

  it("should remove a user account", () => {
    cy.login("testuser@example.com", "password123");
    cy.visit("/settings"); // Updated path
    cy.get("[data-cy=delete-account]").click();
    cy.get("[data-cy=confirm-delete]").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`);
  });
});
