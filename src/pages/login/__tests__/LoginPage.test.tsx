import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { LoginPage } from '../LoginPage';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));

describe('LoginPage', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
		vi.mocked(http).mockReset();
	});

	it('рендерит заголовок «С возвращением» и форму с полем Email', () => {
		renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

		expect(screen.getByText('С возвращением')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Войти' }),
		).toBeInTheDocument();
	});
});
