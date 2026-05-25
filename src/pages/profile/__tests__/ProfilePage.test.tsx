import { describe, expect, it, beforeEach } from 'vitest';

import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { ProfilePage } from '../ProfilePage';

describe('ProfilePage', () => {
	beforeEach(() => {
		useSessionStore.setState({ currentUser: null });
	});

	it('без авторизации редиректит на /login вместо тихого пустого экрана', () => {
		const { getCurrentPath } = renderWithProviders(<ProfilePage />, {
			initialEntries: ['/me'],
		});

		expect(getCurrentPath()).toBe('/login');
	});
});
