import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'public', 'wasm');
fs.mkdirSync(target, { recursive: true });

const assets = [
  ['node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.js', 'qpdf.js'],
  ['node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm', 'qpdf.wasm'],
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
];

for (const [source, name] of assets) {
  const from = path.join(root, source);
  if (!fs.existsSync(from)) throw new Error(`Browser asset not found: ${source}`);
  fs.copyFileSync(from, path.join(target, name));
}

console.log(`Copied ${assets.length} browser assets to public/wasm`);
