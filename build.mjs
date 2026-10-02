import { build } from "esbuild";
import { cpSync, rmSync, mkdirSync } from "node:fs";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
await build({
  entryPoints: { background: "src/background.ts", sidepanel: "src/sidepanel/main.ts" },
  outdir: "dist", bundle: true, format: "esm", target: "chrome121", minify: true,
});
cpSync("public", "dist", { recursive: true });
cpSync("src/sidepanel/index.html", "dist/sidepanel.html");
cpSync("src/sidepanel/style.css", "dist/style.css");
console.log("built -> dist/");
