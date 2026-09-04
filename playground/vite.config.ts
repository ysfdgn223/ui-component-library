import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * The playground consumes `src/` directly — it is the inner loop, not a
 * consumer. The packaged surface is exercised by the tarball check instead.
 */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  build: { outDir: "dist" },
});
