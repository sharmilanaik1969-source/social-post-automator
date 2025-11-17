import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// FIX: Import `process` to provide correct types for `process.cwd()` and resolve the error.
import * as process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      // This shim is required for Vercel deployment to expose environment variables
      // to the client-side code, which uses `process.env`.
      'process.env': env
    },
    plugins: [react()],
  };
});
