import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const portfolioDir = path.join(rootDir, 'assets', 'Portfolio');
const thumbsDir = path.join(portfolioDir, '.thumbs');
const maxSize = 900;

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '.thumbs') {
        return [];
      }

      return walk(fullPath);
    }

    return imageExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function buildThumb(sourcePath) {
  const relativePath = path.relative(portfolioDir, sourcePath);
  const destinationPath = path.join(thumbsDir, relativePath);
  const destinationDir = path.dirname(destinationPath);

  ensureDirectory(destinationDir);

  if (fs.existsSync(destinationPath)) {
    const sourceStat = fs.statSync(sourcePath);
    const destinationStat = fs.statSync(destinationPath);

    if (destinationStat.mtimeMs >= sourceStat.mtimeMs) {
      return destinationPath;
    }
  }

  const result = spawnSync('/usr/bin/sips', ['-Z', String(maxSize), sourcePath, '--out', destinationPath], {
    stdio: 'pipe'
  });

  if (result.status !== 0) {
    throw new Error(`Thumbnail generation failed for ${relativePath}: ${result.stderr.toString()}`);
  }

  return destinationPath;
}

const files = walk(portfolioDir);
files.forEach(buildThumb);

console.log(`Generated ${files.length} thumbnails in ${path.relative(rootDir, thumbsDir)}`);
