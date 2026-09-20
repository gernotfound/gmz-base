import {
  FORZA4_COLS,
  isCellPosition,
  isValidBoard,
  type CellPosition,
  type Forza4Player,
} from './gameLogic';

export type SessionScore = {
  red: number;
  yellow: number;
  draws: number;
};

export type SyncPayload = {
  board: number[][];
  currentPlayer: Forza4Player;
  starter: Forza4Player;
  score: SessionScore;
  roundNumber: number;
  gameState: 'playing' | 'end';
  winner: number | null;
  winningCells: CellPosition[];
};

export type PeerMessage =
  | { type: 'move'; col: number; playerNum: Forza4Player }
  | { type: 'restart-request' }
  | { type: 'restart-accept' }
  | { type: 'restart-decline' }
  | { type: 'sync'; payload: SyncPayload };

export function createHostCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X');
}

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function isValidCode(value: string): boolean {
  return /^[A-Z0-9]{4,6}$/.test(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

export function isSyncPayload(value: unknown): value is SyncPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Partial<SyncPayload>;
  const score = payload.score as Partial<SessionScore> | undefined;

  return (
    isValidBoard(payload.board) &&
    (payload.currentPlayer === 1 || payload.currentPlayer === 2) &&
    (payload.starter === 1 || payload.starter === 2) &&
    isNonNegativeInteger(score?.red) &&
    isNonNegativeInteger(score?.yellow) &&
    isNonNegativeInteger(score?.draws) &&
    Number.isInteger(payload.roundNumber) && Number(payload.roundNumber) >= 1 &&
    (payload.gameState === 'playing' || payload.gameState === 'end') &&
    (payload.winner === null || payload.winner === 0 || payload.winner === 1 || payload.winner === 2) &&
    Array.isArray(payload.winningCells) && payload.winningCells.every(isCellPosition)
  );
}

export function isPeerMessage(data: unknown): data is PeerMessage {
  if (!data || typeof data !== 'object') return false;

  const message = data as {
    type?: unknown;
    col?: unknown;
    playerNum?: unknown;
    payload?: unknown;
  };

  if (
    message.type === 'restart-request' ||
    message.type === 'restart-accept' ||
    message.type === 'restart-decline'
  ) {
    return true;
  }

  if (message.type === 'sync') return isSyncPayload(message.payload);

  return (
    message.type === 'move' &&
    Number.isInteger(message.col) &&
    Number(message.col) >= 0 &&
    Number(message.col) < FORZA4_COLS &&
    (message.playerNum === 1 || message.playerNum === 2)
  );
}
