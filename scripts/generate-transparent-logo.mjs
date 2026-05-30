import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const src = join(root, "public", "logo-3d.png");
const out = join(root, "public", "logo-transparent.png");

// Work at a reasonable size — the image is 6250x6250 at 300dpi
const WORK_SIZE = 1200;
const THRESHOLD = 245; // pixels with R,G,B all above this become transparent

const { data, info } = await sharp(src)
  .resize(WORK_SIZE, WORK_SIZE, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info; // channels = 4 (RGBA)

for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
    data[i + 3] = 0; // fully transparent
  }
}

await sharp(Buffer.from(data), { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`Written → ${out}  (${width}×${height})`);
