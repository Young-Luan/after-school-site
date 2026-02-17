import { mkdir, cp, rm } from 'node:fs/promises';

const OUT_DIR = 'dist';

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

await cp('index.html', `${OUT_DIR}/index.html`);
await cp('styles.css', `${OUT_DIR}/styles.css`);
await cp('src', `${OUT_DIR}/src`, { recursive: true });

console.log('Static site build completed. Output: dist');
