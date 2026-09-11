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
    description: 'Sfida un amico online in tempo reale tramite codice o link di invito, senza account.',
    category: 'Arcade',
    mode: 'P2P online',
    players: '2 giocatori',
    icon: '🔴',
    tags: ['strategia', 'online', 'turni'],
    tone: 'blue',
    featured: true,
    load: () => import('../pages/Forza4'),
  },
  {
    id: 'non-ho-mai',
    path: '/non-ho-mai',
    title: 'Non Ho Mai',
    description: 'Un party game locale con categorie diverse e centinaia di frasi da mischiare a ogni partita.',
    category: 'Party',
    mode: 'Locale',
    players: '2+ giocatori',
    icon: '🍻',
    tags: ['party', 'gruppo', 'domande'],
    tone: 'pink',
    featured: true,
    load: () => import('../pages/NonHoMai'),
  },
  {
    id: 'dnd',
    path: '/dnd',
    title: 'Duce o Non Duce',
    description: 'Quiz storico a frasi: riconosci l’autore, scopri il contesto e misura il tuo punteggio.',
    category: 'Quiz',
    mode: 'Quiz',
    players: '1+ giocatori',
    icon: '🧐',
    tags: ['storia', 'quiz', 'cultura'],
    tone: 'amber',
    load: () => import('../pages/Dnd'),
  },
  {
    id: 'dnd-pro',
    path: '/dnd-pro',
    title: 'Duce o Non Duce · Pro',
    description: 'La variante fotografica del quiz: osserva l’immagine, scegli e verifica subito la risposta.',
    category: 'Quiz',
    mode: 'Quiz fotografico',
    players: '1+ giocatori',
    icon: '🙃',
    tags: ['foto', 'storia', 'quiz'],
    tone: 'orange',
    load: () => import('../pages/DndPro'),
  },
] as const;

export const gameCategories: readonly GameCategory[] = ['Arcade', 'Party', 'Quiz'];
