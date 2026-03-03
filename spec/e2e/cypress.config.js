import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5002",
    defaultCommandTimeout: 10000,
    supportFile: "cypress/support/index.js",
  }
})
