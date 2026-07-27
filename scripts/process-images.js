import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definiamo i percorsi
const rootDir = path.resolve(__dirname, '..');
const rawDir = path.join(rootDir, 'public', 'raw_img_dndpro');
const outDir = path.join(rootDir, 'public', 'img_dndpro');

// Dimensioni target
const TARGET_SIZE = 800;

async function processImages() {
  console.log('Inizio ottimizzazione immagini...');
  
  // Creiamo le cartelle se non esistono
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
    console.log(`Cartella ${rawDir} creata. Inserisci qui le tue foto originali.`);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Leggiamo i file nella cartella raw
  const files = fs.readdirSync(rawDir);
  
  if (files.length === 0) {
    console.log(`Nessuna immagine trovata in ${rawDir}. Aggiungi le foto (es. d001.jpg, nd001.jpg) e riavvia lo script.`);
    return;
  }

  let processedCount = 0;

  for (const file of files) {
    // Ignoriamo i file non immagine
    if (!file.match(/\.(jpg|jpeg|png|webp|heic)$/i)) continue;

    const inputPath = path.join(rawDir, file);
    
    // Per avere un formato uniforme, salviamo tutto in WebP che è molto compresso,
    // o in JPEG per massima compatibilità. Scegliamo WebP.
    const outputFileName = file.replace(/\.[^/.]+$/, "") + ".webp";
    const outputPath = path.join(outDir, outputFileName);

    try {
      await sharp(inputPath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
          fit: 'cover', // Taglia l'immagine per renderla un quadrato perfetto
          position: 'attention' // Cerca di mantenere il volto/soggetto al centro
        })
        .webp({ quality: 80 }) // Compressione WebP all'80% di qualità
        .toFile(outputPath);
        
      console.log(`✅ Processata: ${file} -> ${outputFileName}`);
      processedCount++;
    } catch (err) {
      console.error(`❌ Errore processando ${file}:`, err.message);
    }
  }

  console.log(`\nFinito! Sono state ottimizzate e ritagliate ${processedCount} immagini quadrate.`);
}

processImages();
