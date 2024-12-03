describe('Blockly Test', () => {
    it('should initialize Blockly', () => {
      cy.visit('http://localhost:4000/api/play');  // Adjust to your URL
      cy.window().should('have.property', 'Blockly');  // Wait for Blockly to be initialized
      cy.window().then((win) => {
        expect(win.Blockly).to.exist;
      });
    });
  });
  