import { afterEach, describe, expect, it, vi } from 'vitest';
import { avoidImmediateRepeat, buildBalancedQuiz, buildWeightedQuiz } from './quiz';

type QuizItem = {
  id: string;
  positive: boolean;
};

const isPositive = (item: QuizItem) => item.positive;

const makeItems = (positiveCount: number, negativeCount: number): QuizItem[] => [
  ...Array.from({ length: positiveCount }, (_, index) => ({
    id: `positive-${index + 1}`,
    positive: true,
  })),
  ...Array.from({ length: negativeCount }, (_, index) => ({
    id: `negative-${index + 1}`,
    positive: false,
  })),
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildBalancedQuiz', () => {
  it('balances the quiz using the smaller answer group', () => {
    const items = makeItems(4, 2);
    const result = buildBalancedQuiz(items, isPositive);

    expect(result).toHaveLength(4);
    expect(result.filter(isPositive)).toHaveLength(2);
    expect(result.filter(item => !isPositive(item))).toHaveLength(2);
  });

  it('respects maxPerGroup', () => {
    const items = makeItems(5, 5);
    const result = buildBalancedQuiz(items, isPositive, 2);

    expect(result).toHaveLength(4);
    expect(result.filter(isPositive)).toHaveLength(2);
    expect(result.filter(item => !isPositive(item))).toHaveLength(2);
  });

  it('falls back to a shuffled subset when only one answer group exists', () => {
    const items = makeItems(5, 0);
    const originalIds = items.map(item => item.id);
    const result = buildBalancedQuiz(items, isPositive, 2);

    expect(result).toHaveLength(4);
    expect(result.every(isPositive)).toBe(true);
    expect(items.map(item => item.id)).toEqual(originalIds);
  });

  it('allows natural streaks instead of making the third answer predictable', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    const items = makeItems(3, 3);

    const result = buildBalancedQuiz(items, isPositive, 3);

    expect(result.slice(0, 3).every(isPositive)).toBe(true);
    expect(result.filter(isPositive)).toHaveLength(3);
    expect(result.filter(item => !isPositive(item))).toHaveLength(3);
  });
});

describe('buildWeightedQuiz', () => {
  it('targets roughly twenty percent positive answers without duplicates', () => {
    const items = makeItems(6, 24);
    const result = buildWeightedQuiz(items, isPositive, 12, 0.2);

    expect(result).toHaveLength(12);
    expect(result.filter(isPositive)).toHaveLength(2);
    expect(new Set(result.map(item => item.id)).size).toBe(12);
  });

  it('uses one positive in a six-photo quick round', () => {
    const items = makeItems(6, 24);
    const result = buildWeightedQuiz(items, isPositive, 6, 0.2);

    expect(result).toHaveLength(6);
    expect(result.filter(isPositive)).toHaveLength(1);
  });

  it('uses the complete archive once when the archive itself is twenty percent positive', () => {
    const items = makeItems(6, 24);
    const result = buildWeightedQuiz(items, isPositive, items.length, 0.2);

    expect(result).toHaveLength(30);
    expect(result.filter(isPositive)).toHaveLength(6);
    expect(new Set(result.map(item => item.id)).size).toBe(30);
  });

  it('fully shuffles the selected answers instead of enforcing a periodic cadence', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    const items = makeItems(2, 8);
    const result = buildWeightedQuiz(items, isPositive, 10, 0.2);

    expect(result).toHaveLength(10);
    expect(result.filter(isPositive)).toHaveLength(2);
    expect(result.slice(0, 2).every(isPositive)).toBe(true);
  });
});

describe('avoidImmediateRepeat', () => {
  const isSame = (left: QuizItem, right: QuizItem) => left.id === right.id;

  it('moves an immediate repeat away from the start of a new deck', () => {
    const previous = { id: 'repeat', positive: true };
    const items = [previous, { id: 'next', positive: false }, { id: 'other', positive: true }];

    const result = avoidImmediateRepeat(items, previous, isSame);

    expect(result[0].id).toBe('next');
    expect(result.map(item => item.id).sort()).toEqual(items.map(item => item.id).sort());
    expect(items[0].id).toBe('repeat');
  });

  it('leaves an already-safe deck order unchanged', () => {
    const previous = { id: 'previous', positive: true };
    const items = [{ id: 'next', positive: false }, { id: 'other', positive: true }];

    expect(avoidImmediateRepeat(items, previous, isSame)).toEqual(items);
  });

  it('leaves the deck unchanged when there is no previous item', () => {
    const items = [{ id: 'first', positive: true }, { id: 'second', positive: false }];

    expect(avoidImmediateRepeat(items, undefined, isSame)).toEqual(items);
  });

  it('keeps the deck usable when every item is the same', () => {
    const previous = { id: 'same', positive: true };
    const items = [previous, { ...previous }];

    expect(avoidImmediateRepeat(items, previous, isSame)).toEqual(items);
  });
});
