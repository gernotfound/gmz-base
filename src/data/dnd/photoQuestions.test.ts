import { describe, expect, it } from 'vitest';
import { dndPhotoQuestions } from './photoQuestions';

describe('Duce Pro verified photo archive', () => {
  it('keeps unique photo and source identifiers', () => {
    expect(new Set(dndPhotoQuestions.map(question => question.id)).size).toBe(dndPhotoQuestions.length);
    expect(new Set(dndPhotoQuestions.map(question => question.imageUrl)).size).toBe(dndPhotoQuestions.length);
    expect(new Set(dndPhotoQuestions.map(question => question.sourceUrl)).size).toBe(dndPhotoQuestions.length);
  });

  it('keeps Mussolini at twenty percent of the complete archive', () => {
    const duceCount = dndPhotoQuestions.filter(question => question.isDuce).length;

    expect(dndPhotoQuestions).toHaveLength(35);
    expect(duceCount).toBe(7);
    expect(dndPhotoQuestions.filter(question => !question.isDuce)).toHaveLength(28);
    expect(duceCount / dndPhotoQuestions.length).toBe(0.2);
  });

  it('keeps source and licensing metadata on every photo', () => {
    for (const question of dndPhotoQuestions) {
      expect(question.subject.trim()).not.toBe('');
      expect(question.year.trim()).not.toBe('');
      expect(question.context.trim()).not.toBe('');
      expect(question.sourceLabel.trim()).not.toBe('');
      expect(question.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(question.license.trim()).not.toBe('');
      expect(question.imageUrl).toContain('commons.wikimedia.org/wiki/Special:Redirect/file/');
    }
  });
});
