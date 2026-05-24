import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { http } from '@/shared/api';
import { createWrapper } from '@/test/test-utils';
import { useSaveForm } from '../model/useSaveForm';
import type { FormInput } from '@/entities/form';

vi.mock('@/shared/api', () => ({
	http: vi.fn(),
}));

const mockedHttp = vi.mocked(http);

const baseInput: FormInput = {
	title: 'Новая форма',
	description: '',
	questions: [
		{
			id: 'q-1',
			type: 'short-text',
			body: 'Имя',
			required: true,
			order: 0,
		},
	],
};

describe('useSaveForm', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('создаёт форму POST → /api/forms и редиректит на /forms/:formId/edit', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			expect(url).toBe('/api/forms');
			expect(init?.method).toBe('POST');
			const payload = init?.body as { id: string };
			return { ...(init?.body as object), id: payload.id };
		});

		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/forms/new'],
		});
		const { result } = renderHook(() => useSaveForm({ mode: 'create' }), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save(baseInput);
		});

		await waitFor(() => {
			expect(pathRef.current).toMatch(/^\/forms\/[^/]+\/edit$/);
		});
		expect(result.current.error).toBeNull();
	});

	it('обновляет форму PATCH → /api/forms/:formId без редиректа', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			expect(url).toBe('/api/forms/form-1');
			expect(init?.method).toBe('PATCH');
			return {
				id: 'form-1',
				title: 'Обновлено',
				description: '',
				questions: baseInput.questions,
				createdAt: '2026-01-01T00:00:00.000Z',
				authorId: 'user-1',
			};
		});

		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/forms/new'],
		});
		const { result } = renderHook(
			() => useSaveForm({ mode: 'edit', formId: 'form-1' }),
			{ wrapper: Wrapper },
		);

		await act(async () => {
			await result.current.save({ ...baseInput, title: 'Обновлено' });
		});

		expect(pathRef.current).toBe('/forms/new');
	});

	it('выставляет error при сетевой ошибке и не редиректит', async () => {
		mockedHttp.mockRejectedValue(new Error('boom'));

		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/forms/new'],
		});
		const { result } = renderHook(() => useSaveForm({ mode: 'create' }), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save(baseInput);
		});

		await waitFor(() => {
			expect(result.current.error).not.toBeNull();
		});
		expect(pathRef.current).toBe('/forms/new');
	});
});
