import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('возвращает новое значение только после истечения delayMs', () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => useDebouncedValue(value, 300),
			{ initialProps: { value: 'первое' } },
		);

		expect(result.current).toBe('первое');

		rerender({ value: 'второе' });
		expect(result.current).toBe('первое');

		act(() => {
			vi.advanceTimersByTime(299);
		});
		expect(result.current).toBe('первое');

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe('второе');
	});

	it('при быстрой смене значения учитывается только последнее', () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => useDebouncedValue(value, 200),
			{ initialProps: { value: 'a' } },
		);

		rerender({ value: 'b' });
		act(() => {
			vi.advanceTimersByTime(100);
		});
		rerender({ value: 'c' });
		act(() => {
			vi.advanceTimersByTime(199);
		});
		expect(result.current).toBe('a');

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe('c');
	});
});
