describe("User Registration", () => {
  it("should submit the registration form and redirect to login", () => {
    cy.visit("/api/register");

    const uniqueEmail = `testuser${Date.now()}@example.com`;

    cy.get("[data-cy=first-name-input]").type("testuser");
    cy.get("[data-cy=last-name-input]").type("testuser");
    cy.get("[data-cy=email-input]").type(uniqueEmail);
    cy.get("[data-cy=password-input]").type("password123");
    cy.get("[data-cy=register-button]").click();

    cy.url().should("include", "/api/login");
  });
});
