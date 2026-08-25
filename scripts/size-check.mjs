import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const file = 'dist/vibe.min.js';
const gzipLimit = Math.round(3.5 * 1024);

let raw;
let gzip;
try {
  raw = statSync(file).size;
  gzip = gzipSync(readFileSync(file)).length;
} catch {
  console.error(`SIZE CHECK: ${file} not found. Run \`npm run build\` first.`);
  process.exit(1);
}

console.log(`raw (minified): ${raw} bytes`);
console.log(`gzip:           ${gzip} bytes  (limit ${gzipLimit})`);

if (gzip > gzipLimit) {
  console.error(`SIZE BUDGET EXCEEDED: gzip ${gzip} > ${gzipLimit}`);
  process.exit(1);
}

console.log('SIZE OK');
