  // src/environments/environment.prod.ts
  export const environment = {
    production: true,
    apiUrl: process.env["API_URL"] || 'http://localhost:8080'
  };