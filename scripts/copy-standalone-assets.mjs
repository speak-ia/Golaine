import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneRoot = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneRoot, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneRoot, "public");

if (!fs.existsSync(standaloneRoot)) {
  console.error(
    "copy-standalone-assets: .next/standalone introuvable (build standalone Next.js attendu).",
  );
  process.exit(1);
}

if (!fs.existsSync(staticSrc)) {
  console.error("copy-standalone-assets: .next/static introuvable.");
  process.exit(1);
}

fs.mkdirSync(path.dirname(staticDest), { recursive: true });
fs.cpSync(staticSrc, staticDest, { recursive: true });

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}
