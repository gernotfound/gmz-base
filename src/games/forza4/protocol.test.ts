import { describe, expect, it, vi } from 'vitest';
import { createEmptyBoard } from './gameLogic';
import {
  createHostCode,
  isPeerMessage,
  isSyncPayload,
  isValidCode,
  normalizeCode,
  type SyncPayload,
} from './protocol';

function makeSyncPayload(): SyncPayload {
  return {
    board: createEmptyBoard(),
    currentPlayer: 1,
    starter: 1,
    score: { red: 0, yellow: 0, draws: 0 },
    roundNumber: 1,
    gameState: 'playing',
    winner: null,
    winningCells: [],
  };
}

describe('Forza 4 network protocol', () => {
  it('normalizes and validates room codes', () => {
    expect(normalizeCode(' ab-12 cd ')).toBe('AB12CD');
    expect(normalizeCode('abcdefghi')).toBe('ABCDEF');
    expect(isValidCode('AB12')).toBe(true);
    expect(isValidCode('ABC123')).toBe(true);
    expect(isValidCode('ABC')).toBe(false);
    expect(isValidCode('ABC-12')).toBe(false);
  });

  it('creates six-character host codes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const code = createHostCode();

    expect(code).toMatch(/^[A-Z0-9]{6}$/);
    vi.restoreAllMocks();
  });

  it('accepts valid synchronization payloads', () => {
    expect(isSyncPayload(makeSyncPayload())).toBe(true);
  });

  it('rejects malformed synchronization payloads', () => {
    expect(isSyncPayload({ ...makeSyncPayload(), board: [[0]] })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), currentPlayer: 3 })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), score: { red: -1, yellow: 0, draws: 0 } })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), score: { red: 0.5, yellow: 0, draws: 0 } })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), roundNumber: 0 })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), winner: 9 })).toBe(false);
    expect(isSyncPayload({ ...makeSyncPayload(), winningCells: [{ row: 99, col: 0 }] })).toBe(false);
  });

  it('accepts supported peer messages', () => {
    expect(isPeerMessage({ type: 'move', col: 0, playerNum: 1 })).toBe(true);
    expect(isPeerMessage({ type: 'move', col: 6, playerNum: 2 })).toBe(true);
    expect(isPeerMessage({ type: 'restart-request' })).toBe(true);
    expect(isPeerMessage({ type: 'restart-accept' })).toBe(true);
    expect(isPeerMessage({ type: 'restart-decline' })).toBe(true);
    expect(isPeerMessage({ type: 'sync', payload: makeSyncPayload() })).toBe(true);
  });

  it('rejects unsupported or malformed peer messages', () => {
    expect(isPeerMessage(null)).toBe(false);
    expect(isPeerMessage({ type: 'move', col: -1, playerNum: 1 })).toBe(false);
    expect(isPeerMessage({ type: 'move', col: 7, playerNum: 1 })).toBe(false);
    expect(isPeerMessage({ type: 'move', col: 0, playerNum: 3 })).toBe(false);
    expect(isPeerMessage({ type: 'sync', payload: {} })).toBe(false);
    expect(isPeerMessage({ type: 'unknown' })).toBe(false);
  });
});
