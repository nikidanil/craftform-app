import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
	stubIntersectionObserver,
	triggerLastObserver,
	unstubIntersectionObserver,
} from '@/test/mockIntersectionObserver';

import { useInfiniteWindow } from '../useInfiniteWindow';

describe('useInfiniteWindow', () => {
	beforeEach(() => {
		stubIntersectionObserver();
	});

	afterEach(() => {
		unstubIntersectionObserver();
	});

	it('начальное состояние: displayCount = pageSize, hasMore = true', () => {
		const { result } = renderHook(() => useInfiniteWindow(70, 30));

		expect(result.current.displayCount).toBe(30);
		expect(result.current.hasMore).toBe(true);
	});

	it('при пересечении сентинеля подтягивает следующую страницу до totalCount', () => {
		const { result } = renderHook(() => useInfiniteWindow(70, 30));

		const sentinel = document.createElement('div');
		act(() => {
			result.current.sentinelRef(sentinel);
		});

		act(() => {
			triggerLastObserver();
		});
		expect(result.current.displayCount).toBe(60);
		expect(result.current.hasMore).toBe(true);

		act(() => {
			triggerLastObserver();
		});
		expect(result.current.displayCount).toBe(70);
		expect(result.current.hasMore).toBe(false);
	});

	it('возвращает totalCount как displayCount и hasMore=false, если totalCount меньше pageSize', () => {
		const { result } = renderHook(() => useInfiniteWindow(5, 30));

		expect(result.current.displayCount).toBe(5);
		expect(result.current.hasMore).toBe(false);
	});

	it('reset возвращает displayCount к pageSize', () => {
		const { result } = renderHook(() => useInfiniteWindow(90, 30));

		const sentinel = document.createElement('div');
		act(() => {
			result.current.sentinelRef(sentinel);
		});
		act(() => {
			triggerLastObserver();
		});
		expect(result.current.displayCount).toBe(60);

		act(() => {
			result.current.reset();
		});
		expect(result.current.displayCount).toBe(30);
	});
});
