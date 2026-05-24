import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { SignupPage } from '../SignupPage';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));

describe('SignupPage', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
		vi.mocked(http).mockReset();
	});

	it('рендерит заголовок «Создать аккаунт» и поля Имя/Email', () => {
		renderWithProviders(<SignupPage />, { initialEntries: ['/signup'] });

		expect(screen.getByText('Создать аккаунт')).toBeInTheDocument();
		expect(screen.getByLabelText('Имя')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		).toBeInTheDocument();
	});

	it('содержит ссылку «Войти» на /login', () => {
		renderWithProviders(<SignupPage />, { initialEntries: ['/signup'] });

		const loginLink = screen.getByRole('link', { name: 'Войти' });
		expect(loginLink).toHaveAttribute('href', '/login');
	});
});
