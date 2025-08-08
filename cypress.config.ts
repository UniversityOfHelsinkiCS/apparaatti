import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  e2e: {
   setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
