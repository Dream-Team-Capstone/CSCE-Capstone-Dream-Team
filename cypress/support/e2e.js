// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Set default baseUrl if not configured
Cypress.config(
  "baseUrl",
  Cypress.config("baseUrl") || "http://localhost:4000/api"
);

Cypress.on("uncaught:exception", (err, runnable) => {
  console.error(err); // Log the error for debugging
  return false; // Prevent Cypress from failing the test
});
