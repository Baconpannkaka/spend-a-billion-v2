# Spend a Billion

Ett statiskt fantasishopping-spel byggt med Next.js, React, TypeScript och Tailwind CSS. Projektet innehåller två shoppinglägen:

- **Miljardärsläge:** 10 000 lyxprodukter, fastigheter, fordon, upplevelser, konst, PSA-graderade samlarkort med mera.
- **Vardagsläge:** 10 000 produkter inom mat, elektronik, mobil, hem, kläder, barn, fritid, husdjur, resor med mera.

Allt körs i webbläsaren. Ingen databas, autentisering, tracker eller riktig betalning används.

## Starta lokalt

```bash
npm install
npm run dev
```

Öppna `http://localhost:3000`.

## Kontroller

```bash
npm run verify
npm run build
```

`verify` kör katalogvalidering, bildmanifestvalidering, lint, TypeScript och tester.

## GitHub Pages

Projektet har statisk export och ett färdigt arbetsflöde i `.github/workflows/pages.yml`.

1. Lägg alla projektfiler direkt i repositoryts rot.
2. Gör repositoryt publikt om du använder GitHub Free.
3. Välj **Settings → Pages → GitHub Actions**.
4. Varje push till `main` bygger och publicerar sidan automatiskt.

## Katalogerna

Katalogerna skapas av:

```bash
npm run catalog:generate
```

Resultatet finns i:

- `public/data/catalog-luxury.json`
- `public/data/catalog-everyday.json`

Varje katalog innehåller exakt 10 000 produkter och laddas bara när det aktuella spelläget behöver den. Gränssnittet visar 48 produkter per sida.

### Produkt-id

- Lyx: `lux-000001`
- Vardag: `everyday-000001`

Id:t är permanent och används av varukorg, delningslänkar och framtida bilder.

## Kategorier och samlarkort

Kategorier och produktmallar definieras i `scripts/generate-catalogs.mjs`. Samlarkort har extra metadata för franchise, set, år, kortnummer, språk, graderingsbolag och betyg. PSA-graderade kort från bland annat Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! och sport finns i lyxkatalogen.

## Bilder

Produktbilder är helt separerade från produktkatalogen:

- Bildfiler: `public/products/<productId>.webp`
- Metadata: `public/data/image-manifest.json`
- Osäkra träffar: `public/data/image-review.json`

Webbappen visar endast bilder med status `approved`. Saknas en godkänd bild visas automatiskt en exklusiv placeholder.

Läs `tools/image-importer/README.md` för kontraktet som den framtida Wikimedia-importeraren ska följa.

## Lägga till en bild manuellt

1. Lägg exempelvis `lux-000001.webp` i `public/products/`.
2. Lägg till metadata i `public/data/image-manifest.json`.
3. Sätt status till `unreviewed`.
4. Kontrollera bild, motiv, fotograf och licens.
5. Ändra status till `approved`.
6. Kör `npm run images:validate`.

## Delningslänkar

Ett resultat kodas som validerad, URL-säker data med spelläge, budget, valuta, produkt-id:n och antal. En delad länk öppnar resultatet skrivskyddat. **Utmana en vän** startar ett nytt spel med samma budget men tom varukorg.

## Begränsningar

- Produktpriser, förmögenheter och växelkurser är ungefärliga underhållningsvärden.
- De genererade katalogerna använder produktmallar och variationer för att nå stor bredd. En mindre kärna består av mer igenkännbara produkter.
- Ingen automatisk bildsökning ingår ännu. Projektet är däremot färdigt för att koppla in en separat importerare.
- GitHub Pages kör ingen serverkod efter publicering; allt är därför byggt som statiska sidor och klientlogik.

## Juridiskt

Sidan säljer ingenting och är inte ansluten till de personer eller varumärken som nämns. Produktnamn och varumärken tillhör respektive rättighetsinnehavare. Bildmaterial får bara publiceras när licensvillkoren är verifierade och dokumenterade.

## Språk

Gränssnittet har en central språkstruktur för svenska, engelska, spanska, mandarin, hindi och arabiska. Språkvalet sparas lokalt i webbläsaren och arabiska aktiverar RTL-layout. Produktnamn och de stora genererade katalogtexterna ligger tills vidare kvar i katalogernas originalspråk; de kan senare få separata översättningsfält utan att komponenterna behöver byggas om.

## Förberedda reklamytor

Reklam är avstängd som standard och inga annons- eller spårningsskript laddas. Konfigurationen finns i `src/config/ads.ts` och färdiga platser finns för:

- en responsiv banner på startsidan,
- en desktop-sidokolumn i shoppen,
- en responsiv yta i produktflödet,
- en yta på resultatsidan.

För Google AdSense anges ett godkänt `ca-pub-...` och respektive slot-id i `src/config/ads.ts`, varefter `enabled` sätts till `true`. Kopiera även `public/ads.txt.example` till `public/ads.txt` och ersätt platshållaren med ditt riktiga publisher-id. Lägg inte in riktiga id:n innan sajten och AdSense-kontot är godkända. För besökare inom EES behöver samtyckeshantering införas innan personanpassade annonser aktiveras.
