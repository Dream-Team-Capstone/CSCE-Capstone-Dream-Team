describe("Add Block", () => {
  it("adds a block to the workspace", () => {
    cy.visit("/play");

    // Wait for Blockly scripts to load
    cy.get('script[src*="blockly_compressed.js"]').should("exist");
    cy.get('script[src*="blocks_compressed.js"]').should("exist");
    cy.get('script[src*="python_compressed.js"]').should("exist");

    // Wait for Blockly div
    cy.get("#blocklyDiv").should("be.visible");

    // Wait for toolbox to be ready
    cy.get(".blocklyToolboxContents").should("be.visible");

    // Now check Blockly initialization
    cy.window().should((win) => {
      const workspace = win.Blockly.getMainWorkspace();
      expect(workspace).to.exist;
    });

    // Click Logic category after everything is ready
    cy.get(".blocklyTreeLabel").contains("Logic").click();
    cy.get(".blocklyTreeLabel").contains("Logic").parent();
    cy.wait(1000); // Wait for flyout to open

    // Wait for flyout
    cy.get(".blocklyFlyout").should("be.visible");
    cy.get(".blocklyFlyoutBackground").should("be.visible");

    // Try to add block
    cy.window().then((win) => {
      const workspace = win.Blockly.getMainWorkspace();
      const metrics = workspace.getMetrics();

      cy.get(".blocklyFlyout .blocklyDraggable")
        .first()
        .trigger("mousedown", { force: true })
        .trigger("mousemove", {
          clientX: metrics.viewWidth / 2,
          clientY: metrics.viewHeight / 2,
          force: true,
        })
        .trigger("mouseup", { force: true });

      // Verify block was added
      cy.get(".blocklyWorkspace .blocklyDraggable")
        .should("be.visible")
        .should("have.length.at.least", 1);
    });
  });
});
