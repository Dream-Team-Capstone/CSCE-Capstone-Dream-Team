describe("Navigation", () => {
  beforeEach(() => {
    cy.login("testuser", "password123");
  });

  it("should navigate between main pages", () => {
    cy.visit("/dashboard");
    cy.get("[data-cy=play-link]").click();
    cy.url().should("include", "/play");

    cy.get("[data-cy=progress-link]").click();
    cy.url().should("include", "/progress");

    cy.get("[data-cy=settings-link]").click();
    cy.url().should("include", "/settings");
  });

  it("should handle back/forward navigation", () => {
    cy.visit("/dashboard");
    cy.get("[data-cy=play-link]").click();
    cy.go("back");
    cy.url().should("include", "/dashboard");
    cy.go("forward");
    cy.url().should("include", "/play");
  });
});
