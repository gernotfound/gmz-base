import { describe, expect, it } from 'vitest';
import { getPeerErrorStatus, getReconnectStatus } from './peerSession';

describe('Forza4 peer session status helpers', () => {
  it('maps unavailable host ids to a specific recovery message', () => {
    expect(getPeerErrorStatus('unavailable-id')).toEqual({
      text: 'Codice host già in uso. Ricarica la pagina per generarne uno nuovo.',
      error: true,
    });
  });

  it('maps missing peers to the join-code recovery message', () => {
    expect(getPeerErrorStatus('peer-unavailable')).toEqual({
      text: 'Host non trovato. Controlla il codice e riprova.',
      error: true,
    });
  });

  it('keeps host and guest reconnect copy distinct', () => {
    expect(getReconnectStatus(true).text).toContain('attendo il rientro');
    expect(getReconnectStatus(false).text).toContain('provo a rientrare');
  });

  it('uses explicit copy for manual reconnect retries', () => {
    expect(getReconnectStatus(true, true).text).toBe('Attendo il rientro dell’avversario…');
    expect(getReconnectStatus(false, true).text).toBe('Provo a riconnettermi…');
  });
});
