import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/vm-001',
  server: {
    host: true,
    port: 8083, // Change from 8084 to 8083 if desired
    cors: true,
    // allowedHosts: [
    //   'localhost',
    //   '297b-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app',
    //   '706c-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app',
    //   '8abf-2401-4900-76cd-6a6b-692e-b973-c903-56a7.ngrok-free.app'
    // ],
    proxy: {
      '/api': 'http://localhost:3005',
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
