import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(
  require.resolve("pdfjs-dist/package.json")
);

const publicDir = path.join(process.cwd(), "public", "pdfjs");

const wasmSource = path.join(pdfjsDistPath, "wasm");
const wasmDestination = path.join(publicDir, "wasm");

const standardFontsSource = path.join(
  pdfjsDistPath,
  "standard_fonts"
);

const standardFontsDestination = path.join(
  publicDir,
  "standard_fonts"
);

fs.rmSync(wasmDestination, {
  recursive: true,
  force: true,
});

fs.rmSync(standardFontsDestination, {
  recursive: true,
  force: true,
});

fs.mkdirSync(wasmDestination, {
  recursive: true,
});

fs.mkdirSync(standardFontsDestination, {
  recursive: true,
});

fs.cpSync(wasmSource, wasmDestination, {
  recursive: true,
});

fs.cpSync(standardFontsSource, standardFontsDestination, {
  recursive: true,
});

console.log("✅ PDF.js WASM copied:");
console.log(`   ${wasmDestination}`);

console.log("✅ PDF.js standard fonts copied:");
console.log(`   ${standardFontsDestination}`);
