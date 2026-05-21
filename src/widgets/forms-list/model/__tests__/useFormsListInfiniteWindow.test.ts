import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useFormsListInfiniteWindow } from '../useFormsListInfiniteWindow';

type Observer = {
	target: Element | null;
	trigger: () => void;
};

let createdObservers: Observer[] = [];

class MockIntersectionObserver {
	private readonly observer: Observer;

	constructor(callback: IntersectionObserverCallback) {
		const observerSelf = this;
		this.observer = {
			target: null,
			trigger: () => {
				const entry = {
					isIntersecting: true,
					target: this.observer.target ?? document.createElement('div'),
				} as IntersectionObserverEntry;
				// мок не реализует полный интерфейс IntersectionObserver
				callback(
					[entry],
					observerSelf as unknown as IntersectionObserver,
				);
			},
		};
		createdObservers.push(this.observer);
	}

	observe(target: Element) {
		this.observer.target = target;
	}

	unobserve() {}

	disconnect() {
		this.observer.target = null;
	}

	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

describe('useFormsListInfiniteWindow', () => {
	beforeEach(() => {
		createdObservers = [];
		vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('начальное состояние: displayCount = pageSize, hasMore = true', () => {
		const { result } = renderHook(() => useFormsListInfiniteWindow(70, 30));

		expect(result.current.displayCount).toBe(30);
		expect(result.current.hasMore).toBe(true);
	});

	it('при пересечении сентинеля подтягивает следующую страницу до totalCount', () => {
		const { result } = renderHook(() => useFormsListInfiniteWindow(70, 30));

		const sentinel = document.createElement('div');
		act(() => {
			result.current.sentinelRef(sentinel);
		});

		act(() => {
			createdObservers.at(-1)?.trigger();
		});
		expect(result.current.displayCount).toBe(60);
		expect(result.current.hasMore).toBe(true);

		act(() => {
			createdObservers.at(-1)?.trigger();
		});
		expect(result.current.displayCount).toBe(70);
		expect(result.current.hasMore).toBe(false);
	});

	it('возвращает totalCount как displayCount и hasMore=false, если totalCount меньше pageSize', () => {
		const { result } = renderHook(() => useFormsListInfiniteWindow(5, 30));

		expect(result.current.displayCount).toBe(5);
		expect(result.current.hasMore).toBe(false);
	});

	it('reset возвращает displayCount к pageSize', () => {
		const { result } = renderHook(() => useFormsListInfiniteWindow(90, 30));

		const sentinel = document.createElement('div');
		act(() => {
			result.current.sentinelRef(sentinel);
		});
		act(() => {
			createdObservers.at(-1)?.trigger();
		});
		expect(result.current.displayCount).toBe(60);

		act(() => {
			result.current.reset();
		});
		expect(result.current.displayCount).toBe(30);
	});
});
