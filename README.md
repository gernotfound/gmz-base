# GMZ Base

GMZ Base è un piccolo arcade web costruito con React, TypeScript, Vite e Tailwind CSS. Il progetto è pubblicato come PWA su GitHub Pages e usa routing hash-based, quindi ogni gioco resta raggiungibile anche su hosting statico.

## Sviluppo

```bash
bun install
bun run dev
```

Prima di pubblicare:

```bash
bun run check
bun run build
```

Il comando `build` esegue anche il type-check TypeScript, così gli errori vengono bloccati prima del deploy.

## Architettura dei giochi

Il catalogo è la fonte unica di verità: `src/games/catalog.ts` contiene metadati, route e loader lazy di ogni gioco. La home genera automaticamente ricerca, filtri e card; `App.tsx` genera automaticamente le route e carica il codice del singolo gioco solo quando viene aperto.

Per aggiungere un gioco:

1. crea la pagina in `src/pages/`;
2. aggiungi una sola entry in `src/games/catalog.ts`;
3. assegna categoria, tag, modalità e loader dinamico.

Non serve duplicare markup nella home né aggiungere manualmente una nuova `<Route>`.

## Duce o Non Duce · Pro

Le immagini ottimizzate vivono in `public/img_dndpro`. I file che iniziano con `d` sono classificati come Duce; quelli che iniziano con `nd` come Non Duce.

Per aggiungere immagini originali, mettile in `public/raw_img_dndpro` e avvia:

```bash
bun run process-images
```

Lo script converte le immagini in WebP 800×800 e rigenera `src/data/dnd/images.ts`, evitando glob runtime sulla cartella `public`.

## Deploy

Ogni push su `main` avvia un solo workflow GitHub Pages. Il workflow usa il lockfile Bun in modalità frozen, esegue type-check + build e pubblica `dist`.
