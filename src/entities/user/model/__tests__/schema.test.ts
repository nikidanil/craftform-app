import { describe, expect, it } from 'vitest';
import {
	userSchema,
	userRecordSchema,
	toPublicUser,
} from '../schema';

describe('userSchema', () => {
	it('валидирует публичный объект пользователя без password', () => {
		const parsed = userSchema.parse({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'ivan@formcraft.dev',
		});
		expect(parsed.id).toBe('user-1');
		expect(parsed.email).toBe('ivan@formcraft.dev');
	});

	it('отвергает объект без email', () => {
		const result = userSchema.safeParse({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
		});
		expect(result.success).toBe(false);
	});

	it('отвергает email без @ как невалидный', () => {
		const result = userSchema.safeParse({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'not-an-email',
		});
		expect(result.success).toBe(false);
	});
});

describe('userRecordSchema', () => {
	it('валидирует серверную запись с password', () => {
		const parsed = userRecordSchema.parse({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'ivan@formcraft.dev',
			password: 'password123',
		});
		expect(parsed.password).toBe('password123');
	});

	it('отвергает запись без password', () => {
		const result = userRecordSchema.safeParse({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'ivan@formcraft.dev',
		});
		expect(result.success).toBe(false);
	});
});

describe('toPublicUser', () => {
	it('срезает password при конвертации UserRecord → User', () => {
		const record = {
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'ivan@formcraft.dev',
			password: 'password123',
		};
		const publicUser = toPublicUser(record);
		expect(publicUser).toEqual({
			id: 'user-1',
			firstName: 'Иван',
			lastName: 'Иванов',
			email: 'ivan@formcraft.dev',
		});
		expect(publicUser).not.toHaveProperty('password');
	});
});
