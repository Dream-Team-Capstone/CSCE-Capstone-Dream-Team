describe("Add Block", () => {
  it("adds a block to the workspace", () => {
    cy.visit("http://localhost:4000/api/play");

    // Retry until Blockly is available on the window
    cy.window()
      .should("have.property", "Blockly")
      .wait(1000)
      .then((win) => {
        // Ensure Blockly is available
        //expect(win.Blockly).to.exist;

        // Wait for the Blockly workspace container to be in the DOM
        cy.get("#blocklyDiv").should("exist");

        // Ensure the main workspace is available
        const workspace = win.Blockly.getMainWorkspace();
        cy.wrap(workspace).should("exist");

        // Ensure the toolbox is available
        const toolbox = workspace.getToolbox();
        cy.wrap(toolbox).should("exist");

        // Check if selectCategoryByName exists and is a function
        expect(toolbox.selectCategoryByName).to.be.a("function");

        // Select the 'Logic' category in the toolbox
        toolbox.selectCategoryByName("Logic");

        // Ensure the flyout is visible
        cy.get(".blocklyFlyout").should("not.have.css", "display", "none");
      });

    // Wait for the block to appear in the workspace and drag it
    cy.get(".block").first().trigger("mousedown");
    cy.get(".workspace").trigger("mousemove").trigger("mouseup");

    // Check if the block was added to the workspace
    cy.get(".blocklyBlock").should("exist");

    // Toggle the Python view
    cy.get(".toggle-python").click();
  });
});
