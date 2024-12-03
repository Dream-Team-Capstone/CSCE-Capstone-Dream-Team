describe('User Login', () => {
    it('should log the user in and redirect to the dashboard', () => {
      cy.visit('http://localhost:4000/api/login');  // Visit the login page
      
      // Enter login credentials
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password123');
      
      // Submit the form
      cy.get('form').submit();
      
      // Verify user is redirected to the dashboard
      cy.url().should('include', 'http://localhost:4000/api/dashboard');
    });
  });
  