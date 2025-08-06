import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/' : '/vm-002/',
  server: {
    host: true,
    port: 8084,
    cors: true,
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
