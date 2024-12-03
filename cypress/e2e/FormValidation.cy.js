describe('Form Validation', () => {
    it('should show validation errors for missing or invalid fields', () => {
      cy.visit('http://localhost:4000/api/register');  // Visit the registration page
      
      // Try submitting the form without filling in required fields
      cy.get('form').submit();
      
      // Check for validation errors (assuming error messages are displayed)
      cy.contains('Must fill in ALL fields!').should('be.visible');

      cy.get('input[name="first_name"]').type('testuser'); 
      cy.get('input[name="last_name"]').type('testuser'); 
      
      // Check for an invalid email format
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('form').submit();
      cy.contains('Invalid email address.').should('be.visible');
    });
  });
  