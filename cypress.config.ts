import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  e2e: {
    baseUrl: 'http://localhost:4000',
   setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
