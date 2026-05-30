import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/entities/user';

export const SESSION_STORAGE_KEY = 'formcraft.session';

type SessionState = {
	currentUser: User | null;
	setCurrentUser: (user: User) => void;
	clearSession: () => void;
};

/**
 * Zustand-стор сессии: хранит текущего пользователя и экшены входа/выхода.
 * Персистится в localStorage (ключ `formcraft.session`); `partialize` сохраняет
 * только `currentUser`. Прямой доступ нужен редко — обычно берут селекторы ниже.
 */
export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			currentUser: null,
			setCurrentUser: (user) => set({ currentUser: user }),
			clearSession: () => set({ currentUser: null }),
		}),
		{
			name: SESSION_STORAGE_KEY,
			partialize: (state) => ({ currentUser: state.currentUser }),
		},
	),
);

/** Текущий авторизованный пользователь или `null`. */
export const useCurrentUser = () =>
	useSessionStore((state) => state.currentUser);

/** Признак наличия авторизованного пользователя. */
export const useIsAuthenticated = () =>
	useSessionStore((state) => state.currentUser !== null);

/** Экшен: записать пользователя в сессию (вход). */
export const useSetCurrentUser = () =>
	useSessionStore((state) => state.setCurrentUser);

/** Экшен: очистить сессию (выход). */
export const useClearSession = () =>
	useSessionStore((state) => state.clearSession);
