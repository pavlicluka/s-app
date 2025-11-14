import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { envInjectPlugin } from "./vite-plugin-env-inject"

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [react(), envInjectPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.json'],
  publicDir: 'public',
  // Ensure environment variables are properly exposed to the client
  define: {
    'process.env': JSON.stringify(process.env)
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.json')) {
            return 'locales/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
})