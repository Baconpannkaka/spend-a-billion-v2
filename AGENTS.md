# AGENTS.md

## Produktregler

- Sidan är alltid ett fantasishopping-spel. Ingen riktig betalning eller beställning får införas.
- Budgeten får aldrig överskridas.
- Delade resultat är skrivskyddade.
- En utmaning återanvänder spelläge, valuta och budget men inte originalets varukorg.
- Alla priser lagras i SEK och visas i användarens valda valuta.
- Lyx- och vardagskatalogen ska vardera innehålla exakt 10 000 produkter.
- Produkt-id:n får aldrig återanvändas eller bytas efter publicering.
- Endast bilder med status `approved` får visas.

## Struktur

- `src/app`: statiska routes för GitHub Pages.
- `src/components`: återanvändbara UI- och flödeskomponenter.
- `src/context`: global spelstatus och toast.
- `src/catalog`: asynkron katalog- och bildmanifestladdning.
- `src/lib`: budget, varukorg, sökning, format, delning och achievements.
- `src/data`: små handskrivna referensdata som valuta och förmögenhetsprofiler.
- `scripts/generate-catalogs.mjs`: genererar 20 000 produkter.
- `public/data`: färdiga kataloger och bildmanifest.
- `public/products`: framtida produktbilder döpta efter produkt-id.
- `schemas`: JSON-kontrakt för katalog och bildmanifest.
- `tools/image-importer`: krav för framtida importerare.

## Kodprinciper

- TypeScript strict, inga `any`.
- Stora kataloger importeras inte i React-bundlen; de hämtas som JSON per spelläge.
- Lägg inte in 20 000 dynamiska routes. Produktsidan använder query-parametrar.
- Håll shoppingflödet kompakt och överskådligt; stora redaktionella rubriker hör främst hemma på landningssidor.
- All klientlagring ska valideras innan den används.
- All delningsdata ska valideras och budgetbegränsas.

## Kommandon

```bash
npm run catalog:generate
npm run catalog:validate
npm run images:validate
npm run lint
npm run typecheck
npm test
npm run verify
npm run build
```
