import { describe, expect, it } from 'vitest';
import { EventType } from '@/events';

describe('EventType', () => {
  it('exposes the expected event names', () => {
    expect(EventType.RowFlush).toBe('jg.rowflush');
    expect(EventType.Resize).toBe('jg.resize');
    expect(EventType.Complete).toBe('jg.complete');
    expect(EventType.Destroy).toBe('jg.destroy');
  });
});
