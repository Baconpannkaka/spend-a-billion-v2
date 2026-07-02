# Framtida bildimporterare

Webbappen är färdig för en separat bildimporterare. Importeraren ska inte köras i besökarens webbläsare utan som ett lokalt Node-skript eller en manuell GitHub Action.

## In- och utdata

1. Läs `public/data/catalog-luxury.json` och `public/data/catalog-everyday.json`.
2. Sök endast mot källor där återanvändning och licensmetadata kan kontrolleras, exempelvis Wikimedia Commons.
3. Acceptera bara uttryckligen tillåtna licenser enligt projektets regelverk.
4. Ladda ned och konvertera bilden till WebP.
5. Spara filen som `public/products/<productId>.webp`.
6. Lägg till en post i `public/data/image-manifest.json`.
7. Sätt först status till `unreviewed`. Efter manuell kontroll ändras den till `approved`.
8. Lägg osäkra träffar i `public/data/image-review.json`.

## Manifestpost

```json
{
  "productId": "lux-000001",
  "path": "/products/lux-000001.webp",
  "alt": "Svart supersportbil fotograferad framifrån",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:Example.jpg",
  "creator": "Fotografens namn",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "status": "unreviewed",
  "width": 1600,
  "height": 1200
}
```

Webbappen visar bara bilder med status `approved`. Alla andra produkter använder automatiskt en placeholder.

## Validering

Kör:

```bash
npm run images:validate
```

Kommandot kontrollerar dubbletter, status, obligatorisk metadata och att godkända bildfiler verkligen finns.
