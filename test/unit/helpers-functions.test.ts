import { describe, expect, it } from 'vitest';
import { shuffleArray } from '@/helpers';

describe('shuffleArray', () => {
  it('should shuffle an array', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(array);
    expect(shuffledArray).toEqual(array);
    expect(shuffledArray).toHaveLength(array.length);
    expect(new Set(shuffledArray)).toEqual(new Set(array));
  });
});
