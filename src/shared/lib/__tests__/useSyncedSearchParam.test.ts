import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { createWrapper } from '@/test/test-utils';

import { useSyncedSearchParam } from '../useSyncedSearchParam';

describe('useSyncedSearchParam', () => {
	it('сеттер обновляет URL и возвращает новое значение; при отсутствии параметра отдаёт defaultValue', async () => {
		const { Wrapper, pathRef } = createWrapper({ initialEntries: ['/'] });

		const { result } = renderHook(() => useSyncedSearchParam('q', ''), {
			wrapper: Wrapper,
		});

		expect(result.current[0]).toBe('');

		await act(async () => {
			result.current[1]('Опрос');
		});

		expect(decodeURIComponent(pathRef.current)).toBe('/?q=Опрос');
		expect(result.current[0]).toBe('Опрос');
	});

	it('читает начальное значение параметра из URL при маунте', async () => {
		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/?q=Опрос'],
		});

		const { result } = renderHook(() => useSyncedSearchParam('q', ''), {
			wrapper: Wrapper,
		});

		expect(result.current[0]).toBe('Опрос');

		await act(async () => {
			result.current[1]('Новый');
		});

		expect(decodeURIComponent(pathRef.current)).toBe('/?q=Новый');
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
