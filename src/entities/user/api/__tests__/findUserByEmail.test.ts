import { describe, expect, it, vi, beforeEach } from 'vitest';

import { http } from '@/shared/api';
import { findUserByEmail, createUser } from '..';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

describe('findUserByEmail', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('возвращает первого пользователя при совпадении email', async () => {
		mockedHttp.mockResolvedValueOnce([
			{
				id: 'user-1',
				firstName: 'Иван',
				lastName: 'Иванов',
				email: 'ivan@formcraft.dev',
				password: 'password123',
			},
		]);

		const result = await findUserByEmail('ivan@formcraft.dev');

		expect(mockedHttp).toHaveBeenCalledWith(
			'/api/users?email=ivan%40formcraft.dev',
		);
		expect(result).not.toBeNull();
		expect(result?.id).toBe('user-1');
		expect(result?.password).toBe('password123');
	});

	it('возвращает null, если массив пуст', async () => {
		mockedHttp.mockResolvedValueOnce([]);

		const result = await findUserByEmail('absent@formcraft.dev');

		expect(result).toBeNull();
	});

	it('кодирует спец-символы в email перед запросом', async () => {
		mockedHttp.mockResolvedValueOnce([]);

		await findUserByEmail('user+test@formcraft.dev');

		expect(mockedHttp).toHaveBeenCalledWith(
			'/api/users?email=user%2Btest%40formcraft.dev',
		);
	});
});

describe('createUser', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('POST /api/users отправляет id и password, возвращает публичного User', async () => {
		let capturedBody: unknown = null;
		mockedHttp.mockImplementation(async (url, init) => {
			expect(url).toBe('/api/users');
			expect(init?.method).toBe('POST');
			capturedBody = init?.body;
			return init?.body;
		});

		const created = await createUser({
			firstName: 'Мария',
			lastName: 'Петрова',
			email: 'maria@formcraft.dev',
			password: 'password123',
		});

		expect(capturedBody).toMatchObject({
			firstName: 'Мария',
			lastName: 'Петрова',
			email: 'maria@formcraft.dev',
			password: 'password123',
		});
		expect((capturedBody as { id: string }).id).toEqual(expect.any(String));
		expect(created.email).toBe('maria@formcraft.dev');
		expect(created).not.toHaveProperty('password');
	});
});
