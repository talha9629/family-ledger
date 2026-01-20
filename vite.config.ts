import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Custom plugin to copy service worker to dist
    {
      name: 'copy-service-worker',
      closeBundle() {
        try {
          copyFileSync('service-worker.js', 'dist/service-worker.js');
          copyFileSync('manifest.json', 'dist/manifest.json');
          console.log('✅ Copied service-worker.js and manifest.json to dist');
        } catch (error) {
          console.error('❌ Failed to copy files:', error);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
