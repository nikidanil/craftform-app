import { describe, expect, it, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { Header } from '../Header';

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

describe('Header', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('клик по аватару открывает меню с «Профиль» и «Выход»', async () => {
		useSessionStore.setState({ currentUser: seedUser });
		renderWithProviders(<Header />, { initialEntries: ['/'] });

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Меню пользователя' }));

		expect(await screen.findByRole('menuitem', { name: 'Профиль' })).toBeInTheDocument();
		expect(await screen.findByRole('menuitem', { name: 'Выход' })).toBeInTheDocument();
	});

	it('«Профиль» в меню ведёт на /me', async () => {
		useSessionStore.setState({ currentUser: seedUser });
		const { getCurrentPath } = renderWithProviders(<Header />, { initialEntries: ['/'] });

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Меню пользователя' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Профиль' }));

		expect(getCurrentPath()).toBe('/me');
	});

	it('«Выход» в меню очищает сессию и переводит на /login', async () => {
		useSessionStore.setState({ currentUser: seedUser });
		const { getCurrentPath } = renderWithProviders(<Header />, { initialEntries: ['/'] });

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Меню пользователя' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Выход' }));

		expect(useSessionStore.getState().currentUser).toBeNull();
		expect(getCurrentPath()).toBe('/login');
	});
});
