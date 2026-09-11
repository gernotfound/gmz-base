import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const rawDir = path.join(rootDir, 'public', 'raw_img_dndpro');
const outDir = path.join(rootDir, 'public', 'img_dndpro');
const manifestPath = path.join(rootDir, 'src', 'data', 'dnd', 'images.ts');
const TARGET_SIZE = 800;
const IMAGE_PATTERN = /\.(jpg|jpeg|png|webp|gif|heic)$/i;

function writeManifest() {
  const files = fs
    .readdirSync(outDir)
    .filter(file => IMAGE_PATTERN.test(file))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  const source = `// Generato/aggiornato da scripts/process-images.js.\n// Mantieni qui solo i nomi dei file presenti in public/img_dndpro.\nexport const dndProImageFiles = ${JSON.stringify(files, null, 2)} as const;\n`;
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, source, 'utf8');
  console.log(`Manifest aggiornato: ${files.length} immagini.`);
}

async function processImages() {
  console.log('Inizio ottimizzazione immagini…');
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(rawDir).filter(file => IMAGE_PATTERN.test(file));
  let processedCount = 0;

  if (files.length === 0) {
    console.log(`Nessuna nuova immagine in ${rawDir}. Rigenero comunque il manifest dalle immagini già ottimizzate.`);
  }

  for (const file of files) {
    const inputPath = path.join(rawDir, file);
    const outputFileName = `${path.parse(file).name}.webp`;
    const outputPath = path.join(outDir, outputFileName);

    try {
      await sharp(inputPath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
          fit: 'cover',
          position: 'attention',
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`Processata: ${file} -> ${outputFileName}`);
      processedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Errore processando ${file}: ${message}`);
    }
  }

  writeManifest();
  console.log(`Finito. Immagini processate in questa esecuzione: ${processedCount}.`);
}

processImages().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
