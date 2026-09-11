import { shuffle } from './random';

/**
 * Builds a quiz with the same number of positive/negative answers and avoids
 * streaks longer than two identical answers. This removes answer-frequency
 * bias while keeping the order unpredictable.
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

  const positivePool = positives.slice(0, groupSize);
  const negativePool = negatives.slice(0, groupSize);
  const result: T[] = [];
  let lastWasPositive: boolean | null = null;
  let streak = 0;

  while (positivePool.length > 0 || negativePool.length > 0) {
    const forceOpposite = streak >= 2 && lastWasPositive !== null;
    const positiveAvailable = positivePool.length > 0;
    const negativeAvailable = negativePool.length > 0;

    let pickPositive: boolean;
    if (!positiveAvailable) {
      pickPositive = false;
    } else if (!negativeAvailable) {
      pickPositive = true;
    } else if (forceOpposite) {
      pickPositive = !lastWasPositive;
    } else {
      const remaining = positivePool.length + negativePool.length;
      pickPositive = Math.random() < positivePool.length / remaining;
    }

    const selected = pickPositive ? positivePool.pop() : negativePool.pop();
    if (!selected) continue;

    result.push(selected);
    if (lastWasPositive === pickPositive) {
      streak += 1;
    } else {
      lastWasPositive = pickPositive;
      streak = 1;
    }
  }

  return result;
}
