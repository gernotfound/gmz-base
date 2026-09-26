import { describe, expect, it } from 'vitest';
import { dndPhotoQuestions, type PhotoDifficulty } from './photoQuestions';

const difficulties: PhotoDifficulty[] = ['base', 'medio', 'difficile'];

describe('Duce Pro verified photo archive', () => {
  it('keeps unique photo and source identifiers', () => {
    expect(new Set(dndPhotoQuestions.map(question => question.id)).size).toBe(dndPhotoQuestions.length);
    expect(new Set(dndPhotoQuestions.map(question => question.imageUrl)).size).toBe(dndPhotoQuestions.length);
    expect(new Set(dndPhotoQuestions.map(question => question.sourceUrl)).size).toBe(dndPhotoQuestions.length);
  });

  it('keeps Mussolini at twenty percent of the complete archive', () => {
    const duceCount = dndPhotoQuestions.filter(question => question.isDuce).length;

    expect(dndPhotoQuestions).toHaveLength(30);
    expect(duceCount).toBe(6);
    expect(duceCount / dndPhotoQuestions.length).toBe(0.2);
  });

  it.each(difficulties)('keeps %s at two Duce photos out of ten', difficulty => {
    const pool = dndPhotoQuestions.filter(question => question.difficulty === difficulty);

    expect(pool).toHaveLength(10);
    expect(pool.filter(question => question.isDuce)).toHaveLength(2);
    expect(pool.filter(question => !question.isDuce)).toHaveLength(8);
  });
});
