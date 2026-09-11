export type PhotoDifficulty = 'base' | 'medio' | 'difficile';

export interface DndPhotoQuestion {
  id: string;
  imageUrl: string;
  isDuce: boolean;
  subject: string;
  year: string;
  context: string;
  sourceLabel: string;
  sourceUrl: string;
  license: string;
  difficulty: PhotoDifficulty;
}

function commonsImage(filename: string) {
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}?width=900`;
}

export const dndPhotoQuestions: readonly DndPhotoQuestion[] = [
  {
    id: 'mussolini-1922',
    imageUrl: commonsImage('Benito Mussolini 1922.jpeg'),
    isDuce: true,
    subject: 'Benito Mussolini',
    year: '1922',
    context: 'Ritratto di Mussolini nel novembre 1922, poco dopo la Marcia su Roma e la nomina a presidente del Consiglio.',
    sourceLabel: 'Wikimedia Commons · Benito Mussolini 1922',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benito_Mussolini_1922.jpeg',
    license: 'Pubblico dominio',
    difficulty: 'base',
  },
  {
    id: 'mussolini-march-rome',
    imageUrl: commonsImage('Benito Mussolini 1920s.jpg'),
    isDuce: true,
    subject: 'Benito Mussolini',
    year: '1922',
    context: 'Immagine di Mussolini nel periodo della Marcia su Roma; la scheda Commons la cataloga tra le fotografie del 1922.',
    sourceLabel: 'Wikimedia Commons · Benito Mussolini 1920s',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benito_Mussolini_1920s.jpg',
    license: 'Pubblico dominio',
    difficulty: 'medio',
  },
  {
    id: 'mussolini-1930',
    imageUrl: commonsImage('Benito Mussolini 1930.png'),
    isDuce: true,
    subject: 'Benito Mussolini',
    year: 'anni 1930',
    context: 'Ritratto fotografico di Mussolini conservato su Commons con indicazione di pubblico dominio secondo la disciplina italiana sulle fotografie semplici.',
    sourceLabel: 'Wikimedia Commons · Benito Mussolini 1930',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benito_Mussolini_1930.png',
    license: 'Pubblico dominio',
    difficulty: 'base',
  },
  {
    id: 'mussolini-1935',
    imageUrl: commonsImage('Benito mussolini.jpg'),
    isDuce: true,
    subject: 'Benito Mussolini',
    year: '1935',
    context: 'Ritratto di Mussolini datato 1935 nella scheda di Wikimedia Commons.',
    sourceLabel: 'Wikimedia Commons · Benito mussolini',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benito_mussolini.jpg',
    license: 'Pubblico dominio',
    difficulty: 'medio',
  },
  {
    id: 'mussolini-hitler-1937',
    imageUrl: commonsImage('Benito Mussolini 1930s.jpg'),
    isDuce: true,
    subject: 'Benito Mussolini con Adolf Hitler',
    year: '1937',
    context: 'Mussolini e Hitler durante la visita ufficiale di Mussolini a Monaco; la presenza di due figure rende la foto volutamente più difficile.',
    sourceLabel: 'Wikimedia Commons · Mussolini 1930s',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benito_Mussolini_1930s.jpg',
    license: 'Pubblico dominio · fonte USHMM',
    difficulty: 'difficile',
  },
  {
    id: 'mussolini-1940',
    imageUrl: commonsImage('Mussolini 1940 (retouched).jpg'),
    isDuce: true,
    subject: 'Benito Mussolini',
    year: '1940',
    context: 'Ritaglio ritoccato di una fotografia del 1940 che ritrae Mussolini; Commons la indica come opera anonima in pubblico dominio.',
    sourceLabel: 'Wikimedia Commons · Mussolini 1940',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mussolini_1940_(retouched).jpg',
    license: 'Pubblico dominio',
    difficulty: 'difficile',
  },
  {
    id: 'churchill-1941',
    imageUrl: commonsImage('Winston Churchill cph.3a49758.jpg'),
    isDuce: false,
    subject: 'Winston Churchill',
    year: '1941',
    context: 'Ritratto di Winston Churchill del 1941, proveniente da collezioni indicate da Commons e classificato come pubblico dominio.',
    sourceLabel: 'Wikimedia Commons · Winston Churchill 1941',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Winston_Churchill_cph.3a49758.jpg',
    license: 'Pubblico dominio',
    difficulty: 'base',
  },
  {
    id: 'roosevelt-1933',
    imageUrl: commonsImage('Franklin Delano Roosevelt, Portrait 1933.jpg'),
    isDuce: false,
    subject: 'Franklin D. Roosevelt',
    year: '1933',
    context: 'Ritratto di Franklin Delano Roosevelt del 27 dicembre 1933, con provenienza Library of Congress indicata nella scheda Commons.',
    sourceLabel: 'Wikimedia Commons · F. D. Roosevelt 1933',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Franklin_Delano_Roosevelt,_Portrait_1933.jpg',
    license: 'Pubblico dominio',
    difficulty: 'base',
  },
  {
    id: 'franco-1930',
    imageUrl: commonsImage('Francisco Franco 1930 Portrait.jpg'),
    isDuce: false,
    subject: 'Francisco Franco',
    year: 'circa 1930',
    context: 'Ritratto di Francisco Franco attribuito al fotografo Jalón Ángel. La scheda Commons lo rende disponibile con dedica CC0.',
    sourceLabel: 'Wikimedia Commons · Francisco Franco 1930',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Francisco_Franco_1930_Portrait.jpg',
    license: 'CC0 1.0',
    difficulty: 'medio',
  },
  {
    id: 'de-gaulle-1920',
    imageUrl: commonsImage('Charles de Gaulle en 1920.jpg'),
    isDuce: false,
    subject: 'Charles de Gaulle',
    year: '1920',
    context: 'Fotografia di Charles de Gaulle nel 1920, molto prima della sua leadership della Francia Libera durante la Seconda guerra mondiale.',
    sourceLabel: 'Wikimedia Commons · Charles de Gaulle 1920',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Charles_de_Gaulle_en_1920.jpg',
    license: 'Pubblico dominio',
    difficulty: 'difficile',
  },
  {
    id: 'hitler-1937',
    imageUrl: commonsImage('Adolf Hitler 1937.jpg'),
    isDuce: false,
    subject: 'Adolf Hitler',
    year: '1937',
    context: 'Ritratto di Adolf Hitler del 1937; la fotografia è distinta da Mussolini anche se i due dittatori furono alleati.',
    sourceLabel: 'Wikimedia Commons · Adolf Hitler 1937',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Adolf_Hitler_1937.jpg',
    license: 'Pubblico dominio · fonte USHMM',
    difficulty: 'medio',
  },
  {
    id: 'kennedy-portrait',
    imageUrl: commonsImage('John F Kennedy Official Portrait.jpg'),
    isDuce: false,
    subject: 'John F. Kennedy',
    year: 'ritratto presidenziale',
    context: 'Ritratto ufficiale postumo del presidente statunitense John F. Kennedy; la scheda Commons lo classifica come pubblico dominio negli Stati Uniti.',
    sourceLabel: 'Wikimedia Commons · John F. Kennedy',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:John_F_Kennedy_Official_Portrait.jpg',
    license: 'Pubblico dominio',
    difficulty: 'base',
  },
] as const;
