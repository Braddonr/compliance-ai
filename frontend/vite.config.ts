import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from root directory (one level up from frontend/)
  const env = loadEnv(mode, path.resolve(__dirname, '../'), '');
  
  return {
    base: env.NODE_ENV === "development" ? "/" : env.VITE_BASE_PATH || "/",
    envDir: path.resolve(__dirname, '../'), // Tell Vite where to find .env files
    optimizeDeps: {
      entries: ["src/main.tsx", "src/tempobook/**/*"],
    },
    plugins: [
      react(),
      tempo(),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // @ts-ignore
      allowedHosts: true,
      port: parseInt(env.FRONTEND_PORT || '5173'),
      host: 'localhost',
      proxy: {
        '/api': {
          target: `http://localhost:${env.PORT || '3000'}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api/, '');
            console.log(`🔄 Proxy: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const target = `http://localhost:${env.PORT || '3000'}`;
              console.log(`🌐 Proxying: ${req.method} ${req.url} → ${target}${proxyReq.path}`);
            });
          },
        },
      },
    },
  };
});