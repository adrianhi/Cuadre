import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createIcoBuffer(pngBuffers, sizes) {
  // ICO Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(sizes.length, 4); // count

  let offset = 6 + sizes.length * 16;
  const entries = [];

  for (let i = 0; i < sizes.length; i++) {
    const s = sizes[i];
    const png = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s >= 256 ? 0 : s, 0); // width
    entry.writeUInt8(s >= 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const svgPath = path.join(rootDir, 'apps/landing/public/favicon.svg');
  const svgBuffer = await fs.readFile(svgPath);

  const targetDirs = [
    path.join(rootDir, 'apps/landing/public'),
    path.join(rootDir, 'apps/web/public'),
    path.join(rootDir, 'public'),
  ];

  console.log('Generating favicon assets from:', svgPath);

  // Define sizes
  const iconDefinitions = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
  ];

  // Render PNGs
  const generatedPngs = {};
  for (const def of iconDefinitions) {
    const buffer = await sharp(svgBuffer).resize(def.size, def.size).png().toBuffer();
    generatedPngs[def.name] = buffer;
    console.log(`Rendered ${def.name} (${def.size}x${def.size}px, ${buffer.length} bytes)`);
  }

  // Generate multi-size ICO (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = await Promise.all(
    icoSizes.map((s) => sharp(svgBuffer).resize(s, s).png().toBuffer())
  );
  const icoBuffer = createIcoBuffer(icoPngBuffers, icoSizes);
  console.log(`Created multi-size favicon.ico (${icoSizes.join(', ')}px, ${icoBuffer.length} bytes)`);

  // Write to all target public directories
  for (const dir of targetDirs) {
    await fs.mkdir(dir, { recursive: true });

    // Copy SVG
    await fs.writeFile(path.join(dir, 'favicon.svg'), svgBuffer);

    // Write PNGs
    for (const [name, buf] of Object.entries(generatedPngs)) {
      await fs.writeFile(path.join(dir, name), buf);
    }

    // Write ICO
    await fs.writeFile(path.join(dir, 'favicon.ico'), icoBuffer);

    console.log(`Updated assets in: ${path.relative(rootDir, dir)}`);
  }

  console.log('All favicon assets generated successfully!');
}

main().catch((err) => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
