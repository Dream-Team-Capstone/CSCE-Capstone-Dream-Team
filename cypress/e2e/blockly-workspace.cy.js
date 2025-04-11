describe("Blockly Workspace", () => {
  beforeEach(() => {
    cy.visit("/api/play");

    // Wait for Blockly to initialize
    cy.get("#blocklyDiv").should("be.visible");
    cy.window().should("have.property", "Blockly");
  });

  it("should add blocks to workspace", () => {
    // Wait for the Text category to be available
    cy.get(".blocklyTreeLabel").contains("Text").click();

    // Wait for flyout to be visible and contain blocks
    cy.get(".blocklyFlyout").should("be.visible");
    cy.get("[data-cy=print-block]").should("exist");

    // Trigger block creation
    cy.get("[data-cy=print-block]")
      .trigger("mousedown", { force: true })
      .trigger("mousemove", { clientX: 200, clientY: 200 })
      .trigger("mouseup", { force: true });

    // Verify block was added
    cy.get(".blocklyWorkspace .blocklyDraggable").should(
      "have.length.at.least",
      1
    );
  });
});
