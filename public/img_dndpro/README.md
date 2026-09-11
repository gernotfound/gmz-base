# Immagini · Duce o Non Duce Pro

Le immagini ottimizzate del gioco vivono in questa cartella.

- `d001.webp`, `d002.webp`, … → classificata come Benito Mussolini
- `nd001.webp`, `nd002.webp`, … → classificata come persona diversa da Mussolini

## Stato del dataset legacy

I file attualmente presenti precedono il nuovo audit editoriale: il nome codifica la risposta del quiz, ma nel repository non è conservata una scheda con provenienza, autore/fotografo, data e licenza. Per questo la UI segnala esplicitamente che la provenienza delle foto legacy non è ancora documentata e non inventa identità o contesti aggiuntivi.

Una classificazione `d`/`nd` non va quindi interpretata come una scheda archivistica completa.

## Regola per nuove immagini

Non aggiungere una nuova foto se l'identità del soggetto è incerta. Per ogni nuovo asset conserva almeno:

1. URL della fonte o identificativo dell'archivio/collezione;
2. soggetto identificato;
3. data o periodo, quando disponibili;
4. autore/fotografo, quando noto;
5. stato di copyright, licenza o indicazione di pubblico dominio;
6. eventuale nota utile a distinguere sosia, attori o altre figure storiche.

Preferisci archivi pubblici, istituzioni culturali e raccolte con metadati verificabili.

## Elaborazione

Per aggiungere immagini originali, inseriscile in `public/raw_img_dndpro` e avvia dalla root:

```bash
bun run process-images
```

Lo script ridimensiona a 800×800, converte in WebP e aggiorna automaticamente `src/data/dnd/images.ts`, che resta il manifest tecnico dei file. I metadati storici e di provenienza devono essere conservati separatamente e non possono essere dedotti dal solo nome del file.
