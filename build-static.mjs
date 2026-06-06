import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const ROOT = process.cwd();
const DIST = ROOT + '/dist';

await mkdir(DIST, { recursive: true });

// Copy landing page as index.html
await copyFile(ROOT + '/void-runner-landing.html', DIST + '/index.html');

// Copy game as pixel-game.html
await copyFile(ROOT + '/pixel-game.html', DIST + '/pixel-game.html');

console.log('Built dist/ with index.html and pixel-game.html');
