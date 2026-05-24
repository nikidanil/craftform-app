import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/entities/user';

export const SESSION_STORAGE_KEY = 'formcraft.session';

type SessionState = {
	currentUser: User | null;
	setCurrentUser: (user: User) => void;
	clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			currentUser: null,
			setCurrentUser: (user) => set({ currentUser: user }),
			clearSession: () => set({ currentUser: null }),
		}),
		{ name: SESSION_STORAGE_KEY },
	),
);

export const useCurrentUser = () =>
	useSessionStore((state) => state.currentUser);

export const useIsAuthenticated = () =>
	useSessionStore((state) => state.currentUser !== null);
