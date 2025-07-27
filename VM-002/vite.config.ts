import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/vm-002/',
  server: {
    host: true,
    port: 8084,
    cors: true,
    // For ngrok hosting, add each new ngrok URL here as a string when you get a new one.
    // Example: 'xxxx-xxxx-xxxx.ngrok-free.app'
    allowedHosts: [
      'localhost',
      '297b-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app', // previous ngrok
      '706c-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app',  // current ngrok
      '8abf-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app'   // current ngrok
      // Add new ngrok URLs here as needed
    ],
    proxy: {
      '/api': 'https://black-box-production.up.railway.app',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4174,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib/utils": path.resolve(__dirname, "./src/lib/utils.ts"),
      "@/lib/api": path.resolve(__dirname, "./src/lib/api.ts"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
}));
