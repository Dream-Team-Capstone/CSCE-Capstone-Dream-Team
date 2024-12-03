const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'hne3hq',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
