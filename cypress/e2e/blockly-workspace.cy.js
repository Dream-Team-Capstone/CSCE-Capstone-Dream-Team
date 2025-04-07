describe("Blockly Workspace", () => {
  beforeEach(() => {
    cy.login("testuser", "password123");
    cy.visit("/play");
  });

  it("should add blocks to workspace", () => {
    cy.get("[data-cy=blockly-toolbox]").should("be.visible");
    cy.get("[data-cy=print-block]")
      .trigger("mousedown")
      .trigger("mousemove", { clientX: 200, clientY: 200 })
      .trigger("mouseup");
    cy.get(".blocklyWorkspace")
      .find(".blocklyDraggable")
      .should("have.length", 1);
  });

  it("should save workspace state", () => {
    cy.get("[data-cy=print-block]")
      .trigger("mousedown")
      .trigger("mousemove", { clientX: 200, clientY: 200 })
      .trigger("mouseup");
    cy.get("[data-cy=save-button]").click();
    cy.reload();
    cy.get(".blocklyWorkspace")
      .find(".blocklyDraggable")
      .should("have.length", 1);
  });
});
