import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Usar apenas arquivos .jsx (não .js)
      include: '**/*.jsx',
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    extensions: ['.jsx', '.json'], // Removido .js para forçar uso de .jsx
  },
});
