import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const W = 1200;
const H = 630;

// Fit logo-3d.png inside OG canvas with dark background
const logoPath = join(root, "public", "logo-3d.png");
const outputPath = join(root, "public", "og-image.jpg");

const logoResized = await sharp(logoPath)
  .resize({ width: 900, height: 500, fit: "inside" })
  .toBuffer();

const meta = await sharp(logoResized).metadata();
const left = Math.round((W - meta.width) / 2);
const top = Math.round((H - meta.height) / 2);

await sharp({
  create: { width: W, height: H, channels: 3, background: { r: 10, g: 10, b: 10 } },
})
  .composite([{ input: logoResized, left, top }])
  .jpeg({ quality: 90 })
  .toFile(outputPath);

console.log(`OG image written → ${outputPath}`);
