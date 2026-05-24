import { describe, expect, it, beforeEach } from 'vitest';
import type { User } from '@/entities/user';

import { useSessionStore, SESSION_STORAGE_KEY } from '../store';

const sampleUser: User = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

describe('useSessionStore', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('setCurrentUser переключает currentUser из null в переданного user', () => {
		expect(useSessionStore.getState().currentUser).toBeNull();
		useSessionStore.getState().setCurrentUser(sampleUser);
		expect(useSessionStore.getState().currentUser).toEqual(sampleUser);
	});

	it('clearSession обнуляет текущего пользователя', () => {
		useSessionStore.getState().setCurrentUser(sampleUser);
		useSessionStore.getState().clearSession();
		expect(useSessionStore.getState().currentUser).toBeNull();
	});

	it('persist пишет состояние в localStorage по ключу formcraft.session', () => {
		useSessionStore.getState().setCurrentUser(sampleUser);

		const raw = localStorage.getItem(SESSION_STORAGE_KEY);
		expect(raw).not.toBeNull();
		const parsed = JSON.parse(raw ?? '{}') as {
			state: { currentUser: User | null };
		};
		expect(parsed.state.currentUser?.id).toBe('user-1');
	});

	it('persist обнуляет currentUser в localStorage после clearSession', () => {
		useSessionStore.getState().setCurrentUser(sampleUser);
		useSessionStore.getState().clearSession();

		const raw = localStorage.getItem(SESSION_STORAGE_KEY);
		const parsed = JSON.parse(raw ?? '{}') as {
			state: { currentUser: User | null };
		};
		expect(parsed.state.currentUser).toBeNull();
	});
});
