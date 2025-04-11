describe("Blockly Workspace", () => {
  beforeEach(() => {
    cy.login("testuser", "password123");
    cy.visit("/play");

    // Wait for Blockly to be available
    cy.window()
      .should("have.property", "Blockly")
      .then((win) => {
        // Additional wait to ensure workspace is initialized
        return new Cypress.Promise((resolve) => {
          const checkWorkspace = () => {
            if (win.Blockly.getMainWorkspace()) {
              resolve();
            } else {
              setTimeout(checkWorkspace, 100);
            }
          };
          checkWorkspace();
        });
      });
  });

  it("should add blocks to workspace", () => {
    cy.get("#blocklyDiv")
      .should("be.visible")
      .then(() => {
        cy.window().then((win) => {
          // Wait for Blockly
          cy.wrap(win)
            .its("Blockly")
            .should("exist")
            .then((Blockly) => {
              // Wait for workspace
              const workspace = Blockly.getMainWorkspace();
              cy.wrap(workspace).should("exist");
            });
        });
      });

    cy.get("#blocklyDiv").should("exist");

    cy.window().then((win) => {
      const workspace = win.Blockly.getMainWorkspace();
      cy.wrap(workspace).should("exist");

      // Continue with block tests
      cy.get("[data-cy=blockly-toolbox]").should("be.visible");
      cy.get("[data-cy=print-block]")
        .trigger("mousedown")
        .trigger("mousemove", { clientX: 200, clientY: 200 })
        .trigger("mouseup");
      cy.get(".blocklyWorkspace")
        .find(".blocklyDraggable")
        .should("have.length", 1);
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
