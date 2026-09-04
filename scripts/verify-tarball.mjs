/**
 * Seam 2 — the packed tarball, installed into a scratch consumer.
 *
 * A different contract from the specimen page, and one that cannot be observed
 * from inside this repo: the exports map, the generated types, the client
 * directives, the CSS subpath, and whether unused components actually
 * disappear from a consumer's bundle. `npm link` hides every one of these.
 *
 * Runs at milestone gates, not per commit:  npm run verify:pack
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workDir = join(repoRoot, ".tarball-check");
const consumerDir = join(workDir, "consumer");

const CLIENT_DIRECTIVE = '"use client";';

const checks = [];

function check(name, assertion) {
  try {
    assertion();
    checks.push({ name, ok: true, detail: "" });
  } catch (error) {
    checks.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function relative(root, file) {
  return file.slice(root.length + 1).split("\\").join("/");
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Build, then inspect what was built.
// ---------------------------------------------------------------------------

console.log("- building the library");
run("npm", ["run", "build"], repoRoot);

const distDir = join(repoRoot, "dist");
const srcDir = join(repoRoot, "src");
const distFiles = walk(distDir).map((file) => relative(distDir, file));

check("dist has an ESM entry and its types", () => {
  assert(distFiles.includes("index.js"), "dist/index.js is missing");
  assert(distFiles.includes("index.d.ts"), "dist/index.d.ts is missing");
});

check("dist has exactly one global stylesheet", () => {
  const sheets = distFiles.filter((file) => file.endsWith(".css") && !file.includes("/"));
  assert(
    sheets.length === 1 && sheets[0] === "styles.css",
    `expected only styles.css at the root of dist, found: ${sheets.join(", ")}`,
  );
});

check("components are emitted one file each, with their own CSS", () => {
  for (const component of ["Button", "Card", "Dialog", "Field", "Input", "Table"]) {
    assert(
      distFiles.includes(`components/${component}/${component}.js`),
      `components/${component}/${component}.js is missing`,
    );
  }
  assert(
    distFiles.some((file) => file.endsWith("Button.module.css")),
    "component CSS was not emitted alongside the component",
  );
});

check("no primitive-library type reaches the public types", () => {
  const leaks = distFiles
    .filter((file) => file.endsWith(".d.ts"))
    .filter((file) => readFileSync(join(distDir, file), "utf8").includes("@base-ui"));
  assert(leaks.length === 0, `@base-ui appears in: ${leaks.join(", ")}`);
});

check("every client component chunk keeps its directive", () => {
  const clientModules = walk(srcDir)
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8")))
    .map((file) => relative(srcDir, file).replace(/\.tsx?$/, ".js"));

  assert(clientModules.length > 0, "no source module declares a client directive");
  for (const module of clientModules) {
    const emitted = join(distDir, module);
    assert(existsSync(emitted), `${module} was not emitted`);
    assert(
      readFileSync(emitted, "utf8").startsWith(CLIENT_DIRECTIVE),
      `${module} does not start with the client directive`,
    );
  }
});

// ---------------------------------------------------------------------------
// Pack it, then install it the way a stranger would.
// ---------------------------------------------------------------------------

console.log("- packing");
rmSync(workDir, { recursive: true, force: true });
mkdirSync(consumerDir, { recursive: true });

const packed = JSON.parse(run("npm", ["pack", "--pack-destination", workDir, "--json"], repoRoot))[0];
const tarball = join(workDir, packed.filename);

check("the tarball ships dist and nothing else", () => {
  const unexpected = packed.files
    .map((file) => file.path)
    .filter((path) => !path.startsWith("dist/") && !["package.json", "README.md", "LICENSE"].includes(path));
  assert(unexpected.length === 0, `unexpected files in the tarball: ${unexpected.join(", ")}`);
});

console.log("- installing into a scratch consumer");

writeFileSync(
  join(consumerDir, "package.json"),
  json({
    name: "scratch-consumer",
    private: true,
    type: "module",
    scripts: { build: "vite build", typecheck: "tsc --noEmit" },
  }),
);

writeFileSync(
  join(consumerDir, "tsconfig.json"),
  json({
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM"],
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    },
    include: ["src"],
  }),
);

writeFileSync(
  join(consumerDir, "index.html"),
  '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
);

mkdirSync(join(consumerDir, "src"), { recursive: true });

writeFileSync(
  join(consumerDir, "src/main.tsx"),
  [
    'import { createRoot } from "react-dom/client";',
    'import { Button, UIProvider, type ButtonProps } from "@ysfdgn223/ui";',
    'import "@ysfdgn223/ui/styles.css";',
    "",
    "// Uses the exported props interface: if the types do not resolve, this fails.",
    'const props: ButtonProps = { tone: "accent", size: "lg" };',
    "",
    "createRoot(document.getElementById(\"root\")!).render(",
    '  <UIProvider theme="glass" colorScheme="dark">',
    "    <Button {...props}>Packed and installed</Button>",
    "  </UIProvider>,",
    ");",
    "",
  ].join("\n"),
);

writeFileSync(
  join(consumerDir, "vite.config.ts"),
  [
    'import { defineConfig } from "vite";',
    'import react from "@vitejs/plugin-react";',
    "",
    "export default defineConfig({ plugins: [react()], build: { minify: false } });",
    "",
  ].join("\n"),
);

const { devDependencies } = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));

run(
  "npm",
  [
    "install",
    "--no-audit",
    "--no-fund",
    tarball,
    `react@${devDependencies.react}`,
    `react-dom@${devDependencies["react-dom"]}`,
    `vite@${devDependencies.vite}`,
    `@vitejs/plugin-react@${devDependencies["@vitejs/plugin-react"]}`,
    `typescript@${devDependencies.typescript}`,
    `@types/react@${devDependencies["@types/react"]}`,
    `@types/react-dom@${devDependencies["@types/react-dom"]}`,
  ],
  consumerDir,
);

check("the exports map and the types both resolve for a consumer", () => {
  run("npx", ["tsc", "--noEmit"], consumerDir);
});

check("the stylesheet subpath resolves and carries the tokens", () => {
  const sheet = join(consumerDir, "node_modules/@ysfdgn223/ui/dist/styles.css");
  assert(existsSync(sheet), "dist/styles.css is not present in the installed package");
  const css = readFileSync(sheet, "utf8");
  assert(css.includes("--ui-color-accent"), "the installed stylesheet has no tokens in it");
  assert(css.includes("data-ui-theme=glass"), "the glass theme is missing from the installed stylesheet");
  assert(
    !css.includes("data-ui-theme=flat"),
    "the flat canary was shipped - it is a specification, not a theme",
  );
});

console.log("- building the consumer");
run("npx", ["vite", "build"], consumerDir);

const bundle = walk(join(consumerDir, "dist"))
  .filter((file) => file.endsWith(".js"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

check("what the consumer imports is in its bundle", () => {
  assert(bundle.includes("Packed and installed"), "the consumer's own markup is missing from its bundle");
});

check("what the consumer never imports is absent from its bundle", () => {
  for (const absent of ["DialogPopup", "FloatingFocusManager", "Inventory by warehouse", "alignEnd"]) {
    assert(!bundle.includes(absent), `${absent} survived tree-shaking into the consumer bundle`);
  }
});

// ---------------------------------------------------------------------------

const failed = checks.filter((entry) => !entry.ok);
for (const entry of checks) {
  console.log(`${entry.ok ? "PASS" : "FAIL"}  ${entry.name}`);
  if (!entry.ok) console.log(`      ${entry.detail.split("\n")[0]}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length === 0 ? 0 : 1);
