import { mkdir, cp, rm, stat } from 'node:fs/promises';

const OUT_DIR = 'dist';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

if (await exists('index.html')) {
  await cp('index.html', `${OUT_DIR}/index.html`);
}
if (await exists('styles.css')) {
  await cp('styles.css', `${OUT_DIR}/styles.css`);
}

if (await exists('src')) {
  await cp('src', `${OUT_DIR}/src`, { recursive: true });
} else {
  await mkdir(`${OUT_DIR}/src`, { recursive: true });
  if (await exists('main.mjs')) {
    await cp('main.mjs', `${OUT_DIR}/src/main.mjs`);
  }
  if (await exists('snakeLogic.mjs')) {
    await cp('snakeLogic.mjs', `${OUT_DIR}/src/snakeLogic.mjs`);
  }
}

console.log('Static site build completed. Output: dist');
