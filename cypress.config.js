const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'azmfz7',
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
