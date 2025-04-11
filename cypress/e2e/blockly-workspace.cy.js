describe("Blockly Workspace", () => {
  beforeEach(() => {
    // Login and visit play page
    cy.login("testuser", "password123");
    cy.visit("/play");

    // First wait for scripts to load
    cy.get('script[src*="blockly_compressed.js"]').should("exist");
    cy.get('script[src*="blocks_compressed.js"]').should("exist");
    cy.get('script[src*="python_compressed.js"]').should("exist");

    // Wait for Blockly div and ensure it's visible
    cy.get("#blocklyDiv").should("be.visible");

    // Wait for Blockly to be available and initialized
    cy.window().should("have.property", "Blockly");
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        function checkBlockly() {
          const workspace = win.Blockly.getMainWorkspace();
          if (workspace) {
            resolve(workspace);
          } else {
            setTimeout(checkBlockly, 100);
          }
        }
        checkBlockly();
      });
    });
  });

  it("should add blocks to workspace", () => {
    cy.window().then((win) => {
      expect(win.Blockly).to.exist;
      const workspace = win.Blockly.getMainWorkspace();
      expect(workspace).to.exist;

      // Continue with block tests
      cy.get(".blocklyToolboxContents").should("be.visible");
      cy.get(".blocklyFlyout").should("exist");

      // Try to add a block
      cy.get(".blocklyFlyout .blocklyDraggable")
        .first()
        .trigger("mousedown", { force: true })
        .trigger("mousemove", { clientX: 200, clientY: 200 })
        .trigger("mouseup");

      // Verify block was added
      cy.get(".blocklyWorkspace .blocklyDraggable").should(
        "have.length.at.least",
        1
      );
    });
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
