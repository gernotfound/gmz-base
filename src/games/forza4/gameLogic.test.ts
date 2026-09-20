import { describe, expect, it } from 'vitest';
import {
  FORZA4_COLS,
  FORZA4_ROWS,
  createEmptyBoard,
  dropToken,
  findWinningCells,
  isBoardFull,
  isCellPosition,
  isValidBoard,
  type Forza4Board,
} from './gameLogic';

describe('Forza 4 game logic', () => {
  it('creates an empty 6x7 board', () => {
    const board = createEmptyBoard();

    expect(board).toHaveLength(FORZA4_ROWS);
    expect(board.every(row => row.length === FORZA4_COLS)).toBe(true);
    expect(board.flat().every(cell => cell === 0)).toBe(true);
    expect(isValidBoard(board)).toBe(true);
  });

  it('rejects malformed board data', () => {
    expect(isValidBoard(null)).toBe(false);
    expect(isValidBoard([[0, 1, 2]])).toBe(false);
    expect(isValidBoard(createEmptyBoard().map((row, index) => index === 0 ? [...row.slice(0, -1), 9] : row))).toBe(false);
  });

  it('drops tokens from the bottom without mutating the source board', () => {
    const board = createEmptyBoard();
    const first = dropToken(board, 3, 1);
    const second = first ? dropToken(first.board, 3, 2) : null;

    expect(first?.row).toBe(5);
    expect(second?.row).toBe(4);
    expect(first?.board[5][3]).toBe(1);
    expect(second?.board[4][3]).toBe(2);
    expect(board[5][3]).toBe(0);
  });

  it('rejects invalid and full columns', () => {
    const board = createEmptyBoard();
    const fullBoard = board.map(row => [...row]) as Forza4Board;
    for (let row = 0; row < FORZA4_ROWS; row += 1) fullBoard[row][2] = row % 2 === 0 ? 1 : 2;

    expect(dropToken(board, -1, 1)).toBeNull();
    expect(dropToken(board, FORZA4_COLS, 1)).toBeNull();
    expect(dropToken(fullBoard, 2, 1)).toBeNull();
  });

  it('detects horizontal and vertical wins', () => {
    const horizontal = createEmptyBoard();
    for (let col = 1; col <= 4; col += 1) horizontal[5][col] = 1;

    const vertical = createEmptyBoard();
    for (let row = 2; row <= 5; row += 1) vertical[row][3] = 2;

    expect(findWinningCells(horizontal, 5, 4, 1)).toHaveLength(4);
    expect(findWinningCells(vertical, 2, 3, 2)).toHaveLength(4);
  });

  it('detects both diagonal win directions', () => {
    const downRight = createEmptyBoard();
    downRight[2][1] = 1;
    downRight[3][2] = 1;
    downRight[4][3] = 1;
    downRight[5][4] = 1;

    const downLeft = createEmptyBoard();
    downLeft[2][5] = 2;
    downLeft[3][4] = 2;
    downLeft[4][3] = 2;
    downLeft[5][2] = 2;

    expect(findWinningCells(downRight, 5, 4, 1)).toHaveLength(4);
    expect(findWinningCells(downLeft, 5, 2, 2)).toHaveLength(4);
  });

  it('recognizes full boards and validates cell positions', () => {
    const fullBoard = createEmptyBoard().map(row => row.map((_, col) => (col % 2 === 0 ? 1 : 2))) as Forza4Board;

    expect(isBoardFull(fullBoard)).toBe(true);
    expect(isBoardFull(createEmptyBoard())).toBe(false);
    expect(isCellPosition({ row: 0, col: 0 })).toBe(true);
    expect(isCellPosition({ row: FORZA4_ROWS, col: 0 })).toBe(false);
    expect(isCellPosition({ row: 0, col: FORZA4_COLS })).toBe(false);
  });
});
