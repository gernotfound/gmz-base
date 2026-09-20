import { games } from '../games/catalog';

export interface RouteMetadata {
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, nofollow';
}

const HOME_DESCRIPTION = 'GMZ Base: una raccolta di giochi web rapidi da avviare, pensata per mobile e desktop.';

export function getRouteMetadata(pathname: string): RouteMetadata {
  if (pathname === '/') {
    return {
      title: 'GMZ Base · Arcade Hub',
      description: HOME_DESCRIPTION,
      robots: 'index, follow',
    };
  }

  const game = games.find(item => item.path === pathname);
  if (game) {
    return {
      title: `${game.title} · GMZ Base`,
      description: game.description,
      robots: 'index, follow',
    };
  }

  return {
    title: 'Pagina non trovata · GMZ Base',
    description: 'La pagina richiesta non esiste. Torna al catalogo di GMZ Base per scegliere un gioco.',
    robots: 'noindex, nofollow',
  };
}
