import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const CLIENT_DIRECTIVE = '"use client";';

/**
 * Give every chunk back the client directive its source module declared.
 *
 * Module-level directives are not something a bundler is obliged to keep, and
 * `rollup-plugin-preserve-directives` has not been published since early 2024,
 * so this is a few lines instead of a dependency. It runs on the rendered
 * chunk and prepends only when the directive is missing, which means it is
 * correct whether or not the bundler happens to preserve it today.
 *
 * With `preserveModules` on, a chunk maps one-to-one onto a source file, so
 * the source is the authority — there is no list of component paths to keep in
 * sync, and the directive stays revertible per component.
 */
function preserveClientDirective(): Plugin {
  return {
    name: "ui:preserve-client-directive",
    renderChunk(code, chunk) {
      const source = chunk.facadeModuleId;
      if (source === null || source === undefined || !/\.tsx?$/.test(source)) return null;
      if (!/^\s*["']use client["']/.test(readFileSync(source, "utf8"))) return null;
      if (/^\s*["']use client["']/.test(code)) return null;
      return { code: `${CLIENT_DIRECTIVE}
${code}`, map: null };
    },
  };
}

/**
 * A declaration file for the stylesheet subpath.
 *
 * Without it, a consumer on a modern TypeScript hits
 * "cannot find module or type declarations for side-effect import" on
 * `import "@ysfdgn223/ui/styles.css"` — the import a consumer is told to write
 * in the first line of the README. Two lines here beats every consumer adding
 * an ambient declaration of their own.
 */
function emitStylesheetTypes(): Plugin {
  return {
    name: "ui:emit-stylesheet-types",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "styles.css.d.ts",
        source: ["// Side-effect import only: tokens, theme and reset.", "export {};", ""].join("\n"),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    preserveClientDirective(),
    emitStylesheetTypes(),
    // Injects each module's CSS import into its own chunk, so component CSS
    // tree-shakes alongside the component.
    libInjectCss(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.*"],
      tsconfigPath: fileURLToPath(new URL("./tsconfig.build.json", import.meta.url)),
    }),
  ],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        // The one global sheet a consumer imports: tokens, schemes, theme, reset.
        styles: fileURLToPath(new URL("./src/styles/index.css", import.meta.url)),
      },
      formats: ["es"],
    },
    rollupOptions: {
      // Peers and runtime dependencies stay external — this is a library, not
      // an app.
      external: (id) => /^(react|react-dom|clsx|@base-ui)(\/|$)/.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(new URL("./src", import.meta.url)),
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
