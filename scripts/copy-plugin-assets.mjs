import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, 'dist');

async function main() {
  await mkdir(distDir, { recursive: true });
  await copyFile(resolve(projectRoot, 'manifest.json'), resolve(distDir, 'manifest.json'));
  await copyFile(resolve(projectRoot, 'styles.css'), resolve(distDir, 'styles.css'));
  console.log('Copied plugin assets to dist: manifest.json, styles.css');
}

main().catch((error) => {
  console.error('Failed to copy plugin assets:', error);
  process.exit(1);
});
