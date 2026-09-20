export const FORZA4_ROWS = 6;
export const FORZA4_COLS = 7;

export type Forza4Player = 1 | 2;
export type Forza4Cell = 0 | Forza4Player;
export type Forza4Board = Forza4Cell[][];
export type CellPosition = { row: number; col: number };
export type DropResult = {
  board: Forza4Board;
  row: number;
  col: number;
};

export function createEmptyBoard(): Forza4Board {
  return Array.from({ length: FORZA4_ROWS }, () => Array<Forza4Cell>(FORZA4_COLS).fill(0));
}

export function isValidBoard(value: unknown): value is Forza4Board {
  return Array.isArray(value) && value.length === FORZA4_ROWS && value.every(row =>
    Array.isArray(row) &&
    row.length === FORZA4_COLS &&
    row.every(cell => cell === 0 || cell === 1 || cell === 2),
  );
}

export function isCellPosition(value: unknown): value is CellPosition {
  if (!value || typeof value !== 'object') return false;
  const cell = value as { row?: unknown; col?: unknown };
  return (
    Number.isInteger(cell.row) &&
    Number.isInteger(cell.col) &&
    Number(cell.row) >= 0 &&
    Number(cell.row) < FORZA4_ROWS &&
    Number(cell.col) >= 0 &&
    Number(cell.col) < FORZA4_COLS
  );
}

export function dropToken(
  board: readonly (readonly number[])[],
  col: number,
  player: Forza4Player,
): DropResult | null {
  if (!Number.isInteger(col) || col < 0 || col >= FORZA4_COLS || board[0]?.[col] !== 0) {
    return null;
  }

  const nextBoard = board.map(row => [...row]) as Forza4Board;
  for (let row = FORZA4_ROWS - 1; row >= 0; row -= 1) {
    if (nextBoard[row][col] === 0) {
      nextBoard[row][col] = player;
      return { board: nextBoard, row, col };
    }
  }

  return null;
}

export function findWinningCells(
  board: readonly (readonly number[])[],
  row: number,
  col: number,
  player: Forza4Player,
): CellPosition[] {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;

  for (const [rowDelta, colDelta] of directions) {
    const cells: CellPosition[] = [{ row, col }];

    for (const direction of [-1, 1] as const) {
      let step = 1;
      while (true) {
        const nextRow = row + rowDelta * step * direction;
        const nextCol = col + colDelta * step * direction;
        if (
          nextRow < 0 ||
          nextRow >= FORZA4_ROWS ||
          nextCol < 0 ||
          nextCol >= FORZA4_COLS ||
          board[nextRow][nextCol] !== player
        ) {
          break;
        }
        cells.push({ row: nextRow, col: nextCol });
        step += 1;
      }
    }

    if (cells.length >= 4) return cells;
  }

  return [];
}

export function isBoardFull(board: readonly (readonly number[])[]): boolean {
  return board[0]?.every(cell => cell !== 0) ?? false;
}
