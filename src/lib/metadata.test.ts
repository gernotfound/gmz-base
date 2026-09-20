import { describe, expect, it } from 'vitest';
import { getRouteMetadata } from './metadata';

describe('getRouteMetadata', () => {
  it('returns the homepage metadata', () => {
    expect(getRouteMetadata('/')).toEqual({
      title: 'GMZ Base · Arcade Hub',
      description: 'GMZ Base: una raccolta di giochi web rapidi da avviare, pensata per mobile e desktop.',
      robots: 'index, follow',
    });
  });

  it('uses catalog metadata for a game route', () => {
    const metadata = getRouteMetadata('/forza4');

    expect(metadata.title).toBe('Forza 4 · GMZ Base');
    expect(metadata.description).toContain('Sfida un amico');
    expect(metadata.robots).toBe('index, follow');
  });

  it('marks unknown routes as noindex', () => {
    const metadata = getRouteMetadata('/does-not-exist');

    expect(metadata.title).toBe('Pagina non trovata · GMZ Base');
    expect(metadata.robots).toBe('noindex, nofollow');
  });
});
