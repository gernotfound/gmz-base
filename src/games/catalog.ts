import type { ComponentType } from 'react';

export type GameCategory = 'Arcade' | 'Party' | 'Quiz';
export type GameTone = 'blue' | 'pink' | 'amber' | 'orange';

type GameModule = { default: ComponentType };

export interface GameDefinition {
  id: string;
  path: string;
  title: string;
  description: string;
  category: GameCategory;
  mode: string;
  players: string;
  icon: string;
  tags: readonly string[];
  tone: GameTone;
  featured?: boolean;
  load: () => Promise<GameModule>;
}

export const games: readonly GameDefinition[] = [
  {
    id: 'forza4',
    path: '/forza4',
    title: 'Forza 4',
    description: 'Sfida un amico online o sullo stesso telefono, con punteggio, rivincite e riconnessione della sessione.',
    category: 'Arcade',
    mode: 'Online / locale',
    players: '2 giocatori',
    icon: '🔴',
    tags: ['strategia', 'online', 'locale', 'turni'],
    tone: 'blue',
    featured: true,
    load: () => import('../pages/Forza4'),
  },
  {
    id: 'non-ho-mai',
    path: '/non-ho-mai',
    title: 'Non Ho Mai',
    description: 'Party game 18+ con categorie leggere ed esplicite, preset, turni e mazzi personalizzabili.',
    category: 'Party',
    mode: 'Locale · 18+',
    players: '2+ giocatori',
    icon: '🍻',
    tags: ['party', '18+', 'gruppo', 'domande'],
    tone: 'pink',
    featured: true,
    load: () => import('../pages/NonHoMai'),
  },
  {
    id: 'dnd',
    path: '/dnd',
    title: 'Duce o Non Duce',
    description: 'Quiz storico con modalità rapida, standard e infinita, difficoltà e fonti verificabili dopo ogni risposta.',
    category: 'Quiz',
    mode: 'Quiz storico',
    players: '1+ giocatori',
    icon: '🧐',
    tags: ['storia', 'quiz', 'cultura', 'fonti'],
    tone: 'amber',
    load: () => import('../pages/Dnd'),
  },
  {
    id: 'dnd-pro',
    path: '/dnd-pro',
    title: 'Duce o Non Duce · Pro',
    description: 'Quiz fotografico con immagini storiche tracciate, metadati, licenze e fonti archivistiche consultabili.',
    category: 'Quiz',
    mode: 'Quiz fotografico',
    players: '1+ giocatori',
    icon: '🙃',
    tags: ['foto', 'storia', 'quiz', 'fonti'],
    tone: 'orange',
    load: () => import('../pages/DndPro'),
  },
] as const;

export const gameCategories: readonly GameCategory[] = ['Arcade', 'Party', 'Quiz'];
