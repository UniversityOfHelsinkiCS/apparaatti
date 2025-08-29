import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  e2e: {
   baseUrl: 'http://localhost:3000',
   setupNodeEvents(on, config) {
      on('task', {
        log(message: string) {
          console.log('[CYPRESS LOG]:', message);
          return null;
        },
        // You can add more tasks here
        error(message: string) {
          console.error('[CYPRESS ERROR]:', message);
          return null;
        }
      });

      return config;
    },
  },
});
