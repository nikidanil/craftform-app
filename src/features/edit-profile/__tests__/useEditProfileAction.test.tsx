import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { findUserByEmail, updateUser } from '@/entities/user';
import { useSessionStore } from '@/entities/session';
import { createWrapper } from '@/test/test-utils';

import { useEditProfileAction } from '../model/useEditProfileAction';

vi.mock('@/entities/user', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/user')>();
	return { ...actual, findUserByEmail: vi.fn(), updateUser: vi.fn() };
});

const mockedFindUserByEmail = vi.mocked(findUserByEmail);
const mockedUpdateUser = vi.mocked(updateUser);

const currentUser = {
	id: 'user-1',
	firstName: 'Алексей',
	lastName: 'Иванов',
	email: 'alex@formcraft.dev',
};

const { Wrapper } = createWrapper();

describe('useEditProfileAction', () => {
	beforeEach(() => {
		mockedFindUserByEmail.mockReset();
		mockedUpdateUser.mockReset();
		useSessionStore.setState({ currentUser });
		localStorage.clear();
	});

	it('email занят другим пользователем → ошибка, сессия не меняется', async () => {
		mockedFindUserByEmail.mockResolvedValueOnce({
			id: 'user-2',
			firstName: 'Мария',
			lastName: 'Петрова',
			email: 'maria@formcraft.dev',
			password: 'password123',
		});

		const { result } = renderHook(() => useEditProfileAction(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save({
				firstName: 'Алексей',
				lastName: 'Иванов',
				email: 'maria@formcraft.dev',
			});
		});

		await waitFor(() => expect(result.current.status).toBe('error'));
		expect(result.current.errorMessage).toBe('Введенный Email уже занят');
		expect(mockedUpdateUser).not.toHaveBeenCalled();
		expect(useSessionStore.getState().currentUser?.email).toBe(
			'alex@formcraft.dev',
		);
	});

	it('успешное сохранение → currentUser обновлён, статус success', async () => {
		mockedFindUserByEmail.mockResolvedValueOnce(null);
		mockedUpdateUser.mockResolvedValueOnce({
			id: 'user-1',
			firstName: 'Алексей',
			lastName: 'Сидоров',
			email: 'new@formcraft.dev',
		});

		const { result } = renderHook(() => useEditProfileAction(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save({
				firstName: 'Алексей',
				lastName: 'Сидоров',
				email: 'new@formcraft.dev',
			});
		});

		await waitFor(() => expect(result.current.status).toBe('success'));
		expect(useSessionStore.getState().currentUser?.lastName).toBe('Сидоров');
		expect(useSessionStore.getState().currentUser?.email).toBe(
			'new@formcraft.dev',
		);
	});

	it('email не менялся (та же запись) → ложного конфликта нет, сохраняет', async () => {
		mockedFindUserByEmail.mockResolvedValueOnce({
			id: 'user-1',
			firstName: 'Алексей',
			lastName: 'Иванов',
			email: 'alex@formcraft.dev',
			password: 'password123',
		});
		mockedUpdateUser.mockResolvedValueOnce({
			id: 'user-1',
			firstName: 'Алексей',
			lastName: 'Сидоров',
			email: 'alex@formcraft.dev',
		});

		const { result } = renderHook(() => useEditProfileAction(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save({
				firstName: 'Алексей',
				lastName: 'Сидоров',
				email: 'alex@formcraft.dev',
			});
		});

		await waitFor(() => expect(result.current.status).toBe('success'));
		expect(mockedUpdateUser).toHaveBeenCalled();
		expect(useSessionStore.getState().currentUser?.lastName).toBe('Сидоров');
	});
});
