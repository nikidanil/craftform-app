import { describe, expect, it, vi, beforeEach } from 'vitest';

import { http } from '@/shared/api';
import { updateUser } from '..';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

describe('updateUser', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('PATCH /api/users/:id отправляет патч и возвращает публичного User без password', async () => {
		let capturedUrl = '';
		let capturedInit: unknown = null;
		mockedHttp.mockImplementation(async (url, init) => {
			capturedUrl = url;
			capturedInit = init;
			return {
				id: 'user-1',
				firstName: 'Алексей',
				lastName: 'Иванов',
				email: 'alex@formcraft.dev',
				password: 'password123',
			};
		});

		const updated = await updateUser({
			id: 'user-1',
			patch: {
				firstName: 'Алексей',
				lastName: 'Иванов',
				email: 'alex@formcraft.dev',
			},
		});

		expect(capturedUrl).toBe('/api/users/user-1');
		expect((capturedInit as { method?: string }).method).toBe('PATCH');
		expect((capturedInit as { body?: unknown }).body).toEqual({
			firstName: 'Алексей',
			lastName: 'Иванов',
			email: 'alex@formcraft.dev',
		});
		expect(updated.firstName).toBe('Алексей');
		expect(updated.email).toBe('alex@formcraft.dev');
		expect(updated).not.toHaveProperty('password');
	});
});
