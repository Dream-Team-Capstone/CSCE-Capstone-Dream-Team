describe("Accessibility Settings", () => {
  beforeEach(() => {
    cy.login("testuser", "password123");
    cy.visit("/settings");
  });

  it("should change contrast settings", () => {
    cy.get("[data-cy=high-contrast]").click();
    cy.get("body").should("have.class", "high-contrast");
  });

  it("should change font size", () => {
    cy.get("[data-cy=increase-font]").click();
    cy.get("body").should("have.css", "font-size", "18px");
  });

  it("should persist accessibility settings", () => {
    cy.get("[data-cy=high-contrast]").click();
    cy.reload();
    cy.get("body").should("have.class", "high-contrast");
  });
});
