import { readFile } from "node:fs/promises";
import path from "node:path";

for (const mode of ["luxury", "everyday"]) {
  const filename = path.join(process.cwd(), "public", "data", `catalog-${mode}.json`);
  const catalog = JSON.parse(await readFile(filename, "utf8"));
  if (catalog.mode !== mode || catalog.productCount !== 10_000 || catalog.products.length !== 10_000) throw new Error(`${mode}: katalogen måste innehålla exakt 10 000 produkter.`);
  const ids = new Set();
  for (const product of catalog.products) {
    if (!product.id || ids.has(product.id)) throw new Error(`${mode}: dubbelt eller tomt produkt-id.`);
    ids.add(product.id);
    if (product.mode !== mode || !product.name || !product.categoryId || !product.subcategoryId || !Number.isFinite(product.priceSek) || product.priceSek <= 0) throw new Error(`${mode}: ogiltig produkt ${product.id}.`);
  }
  if (catalog.categories.length < 15) throw new Error(`${mode}: för få huvudkategorier.`);
  console.log(`${mode}: ${catalog.products.length} produkter och ${catalog.categories.length} kategorier godkända.`);
}
