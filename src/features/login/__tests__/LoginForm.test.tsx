import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { LoginForm } from '../ui/LoginForm';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
	password: 'password123',
};

describe('LoginForm', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		useSessionStore.setState({ currentUser: null });
		localStorage.clear();
	});

	it('кнопка «Войти» неактивна при пустых полях и при невалидном email', async () => {
		renderWithProviders(<LoginForm />);
		const submit = screen.getByRole('button', { name: 'Войти' });

		await waitFor(() => expect(submit).toBeDisabled());

		const user = userEvent.setup();
		const emailField = screen.getByLabelText('Email');
		await user.type(emailField, 'not-an-email');
		await user.type(screen.getByLabelText('Пароль'), 'somepass');

		await waitFor(() => expect(submit).toBeDisabled());
		expect(
			await screen.findByText(/корректный email/i),
		).toBeInTheDocument();
	});

	it('успешный логин сохраняет пользователя в сессии и редиректит на /', async () => {
		mockedHttp.mockResolvedValueOnce([seedUser]);

		const { getCurrentPath } = renderWithProviders(<LoginForm />, {
			initialEntries: ['/login'],
		});

		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email'), 'ivan@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'password123');
		await user.click(screen.getByRole('button', { name: 'Войти' }));

		await waitFor(() => expect(getCurrentPath()).toBe('/'));
		const { currentUser } = useSessionStore.getState();
		expect(currentUser?.id).toBe('user-1');
		expect(currentUser).not.toHaveProperty('password');
	});

	it('при неверном пароле показывает «Неверный Email или пароль» и не редиректит', async () => {
		mockedHttp.mockResolvedValueOnce([seedUser]);

		const { getCurrentPath } = renderWithProviders(<LoginForm />, {
			initialEntries: ['/login'],
		});

		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email'), 'ivan@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'wrong-password');
		await user.click(screen.getByRole('button', { name: 'Войти' }));

		await waitFor(() => {
			expect(
				screen.getByText('Неверный Email или пароль'),
			).toBeInTheDocument();
		});
		expect(getCurrentPath()).toBe('/login');
		expect(useSessionStore.getState().currentUser).toBeNull();
	});

	it('если пользователя с таким email нет — показывает ту же ошибку', async () => {
		mockedHttp.mockResolvedValueOnce([]);

		renderWithProviders(<LoginForm />, { initialEntries: ['/login'] });

		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email'), 'absent@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'somepass');
		await user.click(screen.getByRole('button', { name: 'Войти' }));

		await waitFor(() => {
			expect(
				screen.getByText('Неверный Email или пароль'),
			).toBeInTheDocument();
		});
		expect(useSessionStore.getState().currentUser).toBeNull();
	});
});
