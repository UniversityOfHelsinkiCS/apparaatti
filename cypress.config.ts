import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  baseUrl: 'http://localhost:3000',
  e2e: {
   setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
