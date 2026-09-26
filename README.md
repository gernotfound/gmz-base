# GMZ Base

GMZ Base è un arcade web costruito con React, TypeScript, Vite e Tailwind CSS. Il progetto è pubblicato come PWA su Vercel e usa routing hash-based, così ogni gioco resta raggiungibile direttamente anche dopo refresh o installazione della PWA.

## Sviluppo

Il package manager di riferimento è **Bun**. Manteniamo un solo ecosistema di installazione per evitare lockfile divergenti.

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

## Layout mobile

Le pagine di gioco usano le utility condivise `game-screen`, `game-overlay-screen`, safe-area e il componente `GameHomeButton`. La strategia viewport include fallback `vh`, `svh` e `dvh`, così browser mobile e PWA Android/iOS gestiscono meglio barre dinamiche, notch e home indicator.

Per verifiche manuali, prova almeno:

- 320–360 px di larghezza;
- uno schermo Android basso (circa 640–720 px di altezza);
- orientamento portrait con barra browser visibile;
- PWA standalone;
- `prefers-reduced-motion` attivo.

## Forza 4

Forza 4 supporta due giocatori sia online P2P sia sullo stesso dispositivo. La sessione mantiene punteggio e pareggi, alterna il primo giocatore nelle rivincite e richiede l'accettazione dell'avversario prima di iniziare un nuovo round online.

In caso di interruzione breve della connessione, la sessione viene mantenuta e il client prova a riconnettersi. L'host conserva lo stato autorevole e, al rientro dell'altro giocatore, sincronizza scacchiera, turno, risultato, round e punteggio prima di riabilitare le mosse.

## Non Ho Mai · 18+

`Non Ho Mai` è intenzionalmente un party game **18+**. Il corpus comprende categorie leggere e materiale esplicito per adulti; l'accesso mostra una conferma 18+ per sessione. I preset permettono di scegliere rapidamente un tono più leggero oppure un mazzo esplicito.

Qualunque carta può essere scartata durante la partita senza penalità o spiegazioni. Quando si modifica il dataset, non trasformare automaticamente il gioco in una versione teen-safe: l'etichetta 18+ e la separazione delle categorie sono parte del design.

## Dinamiche dei quiz

`src/lib/quiz.ts` contiene gli algoritmi condivisi di selezione casuale dei quiz. Le sequenze non seguono cadenze artificiali prevedibili; ogni gioco decide la propria distribuzione in base al design del round.

`Duce o Non Duce` usa un set editoriale con autore/contesto, difficoltà e fonte consultabile. Le nuove aggiunte vanno inserite solo se l'attribuzione è verificabile; le voci dubbie o apocrife non vanno usate come domande fattuali.

## Duce o Non Duce · Pro

Il gameplay Pro usa `src/data/dnd/photoQuestions.ts`: ogni domanda fotografica dichiara esplicitamente soggetto, periodo, provenienza, licenza e URL della scheda archivistica. L'archivio verificato mantiene una quota del 20% di foto di Mussolini e la risposta non viene dedotta dal prefisso del nome file.

Le vecchie immagini ottimizzate in `public/img_dndpro` restano nel repository come dataset legacy, ma non entrano nel quiz verificato finché non sono accompagnate da metadati attendibili. Le immagini verificate sono caricate dalle rispettive pagine Wikimedia Commons e richiedono rete se non sono già nella cache del browser.

Per ottimizzare eventuali futuri asset locali puoi ancora usare:

```bash
bun run process-images
```

Lo script resta un'utility tecnica di conversione WebP: la provenienza storica e la licenza devono essere documentate separatamente e non possono essere dedotte dal nome del file.

## Deploy

Vercel è l'unico hosting di produzione. I branch di lavoro non devono generare Preview Deployment: `vercel.json` disabilita i deploy automatici per `**` e riabilita esplicitamente solo `main`. Ogni modifica passa da branch e pull request; il check obbligatorio `Validate` esegue TypeScript, test, build e smoke test browser prima del merge.
