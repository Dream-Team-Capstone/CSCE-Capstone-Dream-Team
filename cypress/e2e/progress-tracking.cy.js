describe("Progress Tracking", () => {
  beforeEach(() => {
    cy.login("testuser", "password123");
  });

  it("should track completed lessons", () => {
    cy.visit("/play");
    cy.get("[data-cy=lesson-1]").click();
    cy.get("[data-cy=complete-lesson]").click();
    cy.visit("/progress");
    cy.get("[data-cy=progress-bar]").should("have.attr", "value", "1");
  });

  it("should display user achievements", () => {
    cy.visit("/progress");
    cy.get("[data-cy=achievements-list]").should("be.visible");
  });
});
