describe("User Login", () => {
  it("should log the user in and redirect to the dashboard", () => {
    cy.visit("/api/login");

    cy.get("[data-cy=email-input]").type("testuser@example.com");
    cy.get("[data-cy=password-input]").type("password123");
    cy.get("[data-cy=login-button]").click();

    cy.url().should("include", "/play");
  });
});
