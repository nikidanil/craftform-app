import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { createWrapper } from '@/test/test-utils';

import { useSyncedSearchParam } from '../useSyncedSearchParam';

describe('useSyncedSearchParam', () => {
	it('читает текущее значение параметра из URL', () => {
		const { Wrapper } = createWrapper({ initialEntries: ['/?q=Опрос'] });

		const { result } = renderHook(() => useSyncedSearchParam('q', ''), {
			wrapper: Wrapper,
		});

		expect(result.current[0]).toBe('Опрос');
	});

	it('при отсутствии параметра возвращает defaultValue', () => {
		const { Wrapper } = createWrapper({ initialEntries: ['/'] });

		const { result } = renderHook(
			() => useSyncedSearchParam('sort', 'created-desc'),
			{ wrapper: Wrapper },
		);

		expect(result.current[0]).toBe('created-desc');
	});

	it('сеттер записывает новое значение в URL', async () => {
		const { Wrapper, pathRef } = createWrapper({ initialEntries: ['/'] });

		const { result } = renderHook(() => useSyncedSearchParam('q', ''), {
			wrapper: Wrapper,
		});

		await act(async () => {
			result.current[1]('Опрос');
		});

		expect(decodeURIComponent(pathRef.current)).toBe('/?q=Опрос');
	});

	it('запись значения, равного defaultValue, удаляет параметр из URL', async () => {
		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/?q=Опрос&sort=title-asc'],
		});

		const { result } = renderHook(() => useSyncedSearchParam('q', ''), {
			wrapper: Wrapper,
		});

		await act(async () => {
			result.current[1]('');
		});

		expect(pathRef.current).not.toContain('q=');
		expect(pathRef.current).toContain('sort=title-asc');
	});
});
