describe('User Registration', () => {
    it('should submit the registration form and redirect to dashboard', () => {
      cy.visit('http://localhost:4000/api/register');  // Visit the registration page
      
      const uniqueEmail = `testuser${Date.now()}@example.com`;  // Create a unique email using the current timestamp
      
      // Fill in the registration form
      cy.get('input[name="first_name"]').type('testuser'); 
      cy.get('input[name="last_name"]').type('testuser'); 
      cy.get('input[name="email"]').type(uniqueEmail);  // Use the unique email
      cy.get('input[name="password"]').type('password123');
      
      // Submit the form
      cy.get('form').submit();
      
      // Check if the user is redirected to the login
      cy.url().should('include', 'http://localhost:4000/api/login');
    });
  });
  