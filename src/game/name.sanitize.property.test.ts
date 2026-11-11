import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sanitizeName } from './name';

// Feature: cyberpunk-key-smasher, Property 1: Player name is limited to 16 characters
describe('sanitizeName property', () => {
  it('returns at most 16 chars that are a prefix of the input', () => {
    // **Validates: Requirements 1.3**
    fc.assert(
      fc.property(fc.string({ unit: 'binary', maxLength: 100 }), (raw) => {
        const result = sanitizeName(raw);
        expect(result.length).toBeLessThanOrEqual(16);
        expect(raw.startsWith(result)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
