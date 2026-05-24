import { describe, expect, it, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { LogoutButton } from '../ui/LogoutButton';

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

describe('LogoutButton', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('клик очищает сессию и редиректит на /login', async () => {
		useSessionStore.setState({ currentUser: seedUser });

		const { getCurrentPath } = renderWithProviders(<LogoutButton />, {
			initialEntries: ['/'],
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Выход' }));

		expect(useSessionStore.getState().currentUser).toBeNull();
		expect(getCurrentPath()).toBe('/login');
	});
});
