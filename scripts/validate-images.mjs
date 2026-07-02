import { access, readFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "public", "data", "image-manifest.json");
const manifest = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(manifest.images)) throw new Error("Bildmanifestet saknar images-lista.");
const ids = new Set();
for (const image of manifest.images) {
  if (!image.productId || ids.has(image.productId)) throw new Error(`Dubbelt eller tomt bild-id: ${image.productId}`);
  ids.add(image.productId);
  if (!["placeholder", "unreviewed", "approved", "rejected"].includes(image.status)) throw new Error(`Ogiltig bildstatus för ${image.productId}`);
  if (image.status === "approved") {
    if (!image.path || !image.alt || !image.sourceUrl || !image.license) throw new Error(`Godkänd bild ${image.productId} saknar metadata.`);
    await access(path.join(process.cwd(), "public", image.path.replace(/^\//, "")));
  }
}
console.log(`Bildmanifest: ${manifest.images.length} poster godkända.`);
