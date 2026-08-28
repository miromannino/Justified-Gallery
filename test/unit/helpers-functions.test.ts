// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { checkOrConvertNumber, createSpinner, shuffleArray } from '@/helpers';

describe('shuffleArray', () => {
  it('should shuffle an array', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(array);
    expect(shuffledArray).toEqual(array);
    expect(shuffledArray).toHaveLength(array.length);
    expect(new Set(shuffledArray)).toEqual(new Set(array));
  });

  it('mutates and returns the same array reference', () => {
    const array = [1, 2, 3];
    expect(shuffleArray(array)).toBe(array);
  });
});

describe('createSpinner', () => {
  it('creates a div with the jg-spinner class and three span children', () => {
    const spinner = createSpinner();
    expect(spinner.tagName).toBe('DIV');
    expect(spinner.className).toBe('jg-spinner');
    expect(spinner.querySelectorAll('span')).toHaveLength(3);
  });
});

describe('checkOrConvertNumber', () => {
  it('leaves a valid number untouched', () => {
    const container = { value: 42 };
    checkOrConvertNumber(container, 'value');
    expect(container.value).toBe(42);
  });

  it('converts a numeric string to a number', () => {
    const container: Record<string, unknown> = { value: '3.14' };
    checkOrConvertNumber(container, 'value');
    expect(container.value).toBe(3.14);
  });

  it('throws for a non-numeric string', () => {
    const container: Record<string, unknown> = { value: 'not-a-number' };
    expect(() => checkOrConvertNumber(container, 'value')).toThrow(
      'Invalid number for value'
    );
  });

  it('throws when the value is neither a number nor a string', () => {
    const container: Record<string, unknown> = { value: true };
    expect(() => checkOrConvertNumber(container, 'value')).toThrow(
      'value must be a number'
    );
  });

  it('throws for NaN', () => {
    const container: Record<string, unknown> = { value: NaN };
    expect(() => checkOrConvertNumber(container, 'value')).toThrow(
      'Invalid number for value'
    );
  });
});
