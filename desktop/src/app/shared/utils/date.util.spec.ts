import { describe, expect, it } from 'vitest';

import { isNotFutureDate, parseLocalDate, toDateInputValue } from './date.util';

describe('date.util', () => {
    describe('parseLocalDate', () => {
        it('should parse a date-only string into a Date representing that same local calendar day', () => {
            const date = parseLocalDate('1998-01-29');

            expect(date.getFullYear()).toBe(1998);
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(29);
        });
    });

    describe('toDateInputValue', () => {
        it('should format a Date back into the same yyyy-MM-dd string it was parsed from, regardless of timezone', () => {
            expect(toDateInputValue(parseLocalDate('1998-01-29'))).toBe('1998-01-29');
        });

        it('should not roll the date back by one day (the API/UTC-midnight off-by-one bug)', () => {
            const date = new Date(1998, 0, 29, 0, 0, 0);

            expect(toDateInputValue(date)).toBe('1998-01-29');
        });
    });

    describe('isNotFutureDate', () => {
        it('should return true for an empty value', () => {
            expect(isNotFutureDate('', new Date())).toBe(true);
        });

        it('should return true for today and past dates', () => {
            const today = parseLocalDate('2026-07-16');

            expect(isNotFutureDate('2026-07-16', today)).toBe(true);
            expect(isNotFutureDate('2020-01-01', today)).toBe(true);
        });

        it('should return false for a future date', () => {
            const today = parseLocalDate('2026-07-16');

            expect(isNotFutureDate('2026-07-17', today)).toBe(false);
        });
    });
});
