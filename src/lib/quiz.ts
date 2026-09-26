import { shuffle } from './random';

/**
 * Builds a quiz with the same number of positive/negative answers.
 * The final order is fully shuffled and does not constrain streak length,
 * so players cannot infer the next answer from an enforced sequence pattern.
 */
export function buildBalancedQuiz<T>(
  items: readonly T[],
  isPositive: (item: T) => boolean,
  maxPerGroup = 10,
): T[] {
  const positives = shuffle(items.filter(isPositive)).slice(0, maxPerGroup);
  const negatives = shuffle(items.filter(item => !isPositive(item))).slice(0, maxPerGroup);
  const groupSize = Math.min(positives.length, negatives.length);

  if (groupSize === 0) {
    return shuffle(items).slice(0, Math.min(items.length, maxPerGroup * 2));
  }

  return shuffle([
    ...positives.slice(0, groupSize),
    ...negatives.slice(0, groupSize),
  ]);
}

/**
 * Builds a unique random quiz with a target share of positive answers.
 * Selection and final order are both randomized; no periodic answer pattern is enforced.
 */
export function buildWeightedQuiz<T>(
  items: readonly T[],
  isPositive: (item: T) => boolean,
  maxItems: number,
  positiveShare = 0.2,
): T[] {
  const targetSize = Math.max(0, Math.min(items.length, Math.floor(maxItems)));
  if (targetSize === 0) return [];

  const positives = shuffle(items.filter(isPositive));
  const negatives = shuffle(items.filter(item => !isPositive(item));
  const normalizedShare = Math.min(1, Math.max(0, positiveShare));
  const desiredPositiveCount = Math.min(positives.length, Math.round(targetSize * normalizedShare));
  const desiredNegativeCount = Math.min(negatives.length, targetSize - desiredPositiveCount);

  const selected = [
    ...positives.slice(0, desiredPositiveCount),
    ...negatives.slice(0, desiredNegativeCount),
  ];

  if (selected.length < targetSize) {
    selected.push(
      ...shuffle([
        ...positives.slice(desiredPositiveCount),
        ...negatives.slice(desiredNegativeCount),
      ]).slice(0, targetSize - selected.length),
    );
  }

  return shuffle(selected);
}

/**
 * Keeps a freshly generated deck random while preventing its first item from
 * immediately repeating the item that just ended the previous deck.
 */
export function avoidImmediateRepeat<T>(
  items: readonly T[],
  previousItem: T | undefined,
  isSame: (left: T, right: T) => boolean,
): T[] {
  const next = [...items];
  if (!previousItem || next.length < 2 || !isSame(next[0], previousItem)) return next;

  const replacementIndex = next.findIndex((item, index) => index > 0 && !isSame(item, previousItem));
  if (replacementIndex === -1) return next;

  [next[0], next[replacementIndex]] = [next[replacementIndex], next[0]];
  return next;
}
