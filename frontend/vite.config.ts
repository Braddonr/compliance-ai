import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from root directory (one level up from frontend/)
  const env = loadEnv(mode, path.resolve(__dirname, "../"), "");

  return {
    base: env.NODE_ENV === "development" ? "/" : env.VITE_BASE_PATH || "/",
    envDir: path.resolve(__dirname, "../"), // Tell Vite where to find .env files
    optimizeDeps: {
      entries: ["src/main.tsx", "src/tempobook/**/*"],
    },
    plugins: [react(), tempo()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // @ts-ignore
      allowedHosts: true,
      port: parseInt(env.FRONTEND_PORT || "5173"),
      host: "localhost",
    },
  };
});
