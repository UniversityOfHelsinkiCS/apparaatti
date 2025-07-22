import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  e2e: {
    baseUrl: 'http://ipv6.localhost:3000',
   setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
