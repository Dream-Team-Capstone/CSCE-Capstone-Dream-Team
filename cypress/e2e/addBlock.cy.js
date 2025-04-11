describe("Add Block", () => {
  it("adds a block to the workspace", () => {
    cy.visit("/play");

    // Wait for Blockly scripts to load first
    cy.get('script[src*="blockly_compressed.js"]').should("exist");
    cy.get('script[src*="blocks_compressed.js"]').should("exist");
    cy.get('script[src*="python_compressed.js"]').should("exist");

    // Wait for Blockly div and ensure it's visible
    cy.get("#blocklyDiv").should("be.visible");

    // Wait for Blockly to initialize
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        function checkBlockly() {
          if (win.Blockly && win.Blockly.getMainWorkspace()) {
            resolve();
          } else {
            setTimeout(checkBlockly, 100);
          }
        }
        checkBlockly();
      });
    });

    // Now interact with the workspace
    cy.window().then((win) => {
      const workspace = win.Blockly.getMainWorkspace();
      expect(workspace).to.exist;

      const toolbox = workspace.getToolbox();
      expect(toolbox).to.exist;

      // Select the Logic category
      toolbox.selectCategoryByName("Logic");

      // Wait for flyout to be visible
      cy.get(".blocklyFlyout").should("be.visible");

      // Try to add block
      cy.get(".blocklyFlyout .blocklyDraggable")
        .first()
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
});
