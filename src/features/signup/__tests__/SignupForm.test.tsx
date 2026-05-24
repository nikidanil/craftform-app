import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { SignupForm } from '../ui/SignupForm';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const fillValidFields = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText('Имя'), 'Иван');
	await user.type(screen.getByLabelText('Фамилия'), 'Иванов');
	await user.type(screen.getByLabelText('Email'), 'new@formcraft.dev');
	await user.type(screen.getByLabelText('Пароль'), 'password123');
	await user.type(
		screen.getByLabelText('Повторите пароль'),
		'password123',
	);
};

describe('SignupForm', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		useSessionStore.setState({ currentUser: null });
		localStorage.clear();
	});

	it('кнопка «Зарегистрироваться» неактивна при пустых полях', async () => {
		renderWithProviders(<SignupForm />);
		const submit = screen.getByRole('button', { name: 'Зарегистрироваться' });
		await waitFor(() => expect(submit).toBeDisabled());
	});

	it('если пароли не совпадают — кнопка disabled и виден текст «Пароли не совпадают»', async () => {
		renderWithProviders(<SignupForm />);
		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Имя'), 'Иван');
		await user.type(screen.getByLabelText('Фамилия'), 'Иванов');
		await user.type(screen.getByLabelText('Email'), 'new@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'password123');
		await user.type(
			screen.getByLabelText('Повторите пароль'),
			'mismatch1234',
		);

		await waitFor(() => {
			expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
		});
		expect(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		).toBeDisabled();
	});

	it('если email уже занят — показывает «Введенный Email уже занят», не редиректит', async () => {
		mockedHttp.mockResolvedValueOnce([
			{
				id: 'user-1',
				firstName: 'Иван',
				lastName: 'Иванов',
				email: 'new@formcraft.dev',
				password: 'password123',
			},
		]);

		const { getCurrentPath } = renderWithProviders(<SignupForm />, {
			initialEntries: ['/signup'],
		});

		const user = userEvent.setup();
		await fillValidFields(user);
		await user.click(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		);

		await waitFor(() => {
			expect(
				screen.getByText('Введенный Email уже занят'),
			).toBeInTheDocument();
		});
		expect(getCurrentPath()).toBe('/signup');
		expect(useSessionStore.getState().currentUser).toBeNull();
	});

	it('успешная регистрация авто-логинит и редиректит на /', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url.startsWith('/api/users?email=')) return [];
			if (url === '/api/users' && init?.method === 'POST') {
				return init.body;
			}
			throw new Error(`unexpected ${url}`);
		});

		const { getCurrentPath } = renderWithProviders(<SignupForm />, {
			initialEntries: ['/signup'],
		});

		const user = userEvent.setup();
		await fillValidFields(user);
		await user.click(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		);

		await waitFor(() => expect(getCurrentPath()).toBe('/'));
		const { currentUser } = useSessionStore.getState();
		expect(currentUser?.email).toBe('new@formcraft.dev');
		expect(currentUser?.firstName).toBe('Иван');
		expect(currentUser).not.toHaveProperty('password');
	});
});
