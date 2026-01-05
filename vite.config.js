import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external connections
    // Allow ngrok and other tunnel services
    allowedHosts: [
      'localhost',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.app',
      // Allow all ngrok subdomains
      /.*\.ngrok.*/,
    ],
  },
  // Expose env variables to frontend (must start with VITE_)
  envPrefix: 'VITE_',
});

