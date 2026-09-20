import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildBalancedQuiz } from './quiz';

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
