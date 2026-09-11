# Immagini · Duce o Non Duce Pro

Le immagini ottimizzate del gioco vivono in questa cartella.

- `d001.webp`, `d002.webp`, … → Duce
- `nd001.webp`, `nd002.webp`, … → Non Duce

Per aggiungere nuove foto, inserisci gli originali in `public/raw_img_dndpro` e avvia dalla root:

```bash
bun run process-images
```

Lo script ridimensiona a 800×800, converte in WebP e aggiorna automaticamente `src/data/dnd/images.ts`, che è il manifest usato dal gioco.
