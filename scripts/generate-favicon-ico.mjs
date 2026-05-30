import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public", "logo-3d.png");

// Generate PNG buffers for 16x16 and 32x32
const sizes = [16, 32];
const buffers = await Promise.all(sizes.map(s =>
  sharp(src)
    .resize(s, s, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .png()
    .toBuffer()
));

// Build ICO file (PNG-in-ICO format, supported since Windows Vista / all modern browsers)
const count = sizes.length;
const HEADER = 6;
const ENTRY  = 16;
const dirSize = HEADER + count * ENTRY;

let offset = dirSize;

const header = Buffer.alloc(HEADER);
header.writeUInt16LE(0, 0);      // reserved
header.writeUInt16LE(1, 2);      // type: 1 = ICO
header.writeUInt16LE(count, 4);  // image count

const dir = Buffer.alloc(count * ENTRY);
for (let i = 0; i < count; i++) {
  const s = sizes[i];
  const len = buffers[i].length;
  const e = i * ENTRY;
  dir.writeUInt8(s, e);          // width  (0 means 256)
  dir.writeUInt8(s, e + 1);      // height
  dir.writeUInt8(0, e + 2);      // palette size (0 = no palette)
  dir.writeUInt8(0, e + 3);      // reserved
  dir.writeUInt16LE(1,  e + 4);  // colour planes
  dir.writeUInt16LE(32, e + 6);  // bits per pixel
  dir.writeUInt32LE(len,    e + 8);   // image data size
  dir.writeUInt32LE(offset, e + 12);  // image data offset
  offset += len;
}

const ico = Buffer.concat([header, dir, ...buffers]);

const outPath = join(root, "src", "app", "favicon.ico");
writeFileSync(outPath, ico);
console.log(`Written → ${outPath}  (${ico.length} bytes, sizes: ${sizes.join(", ")})`);
