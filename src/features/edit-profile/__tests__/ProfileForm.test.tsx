import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { useSessionStore } from '@/entities/session';
import { renderWithProviders } from '@/test/test-utils';

import { ProfileForm } from '../ui/ProfileForm';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const user = {
	id: 'user-1',
	firstName: 'Алексей',
	lastName: 'Иванов',
	email: 'alex@formcraft.dev',
};

beforeEach(() => {
	mockedHttp.mockReset();
	useSessionStore.setState({ currentUser: user });
	localStorage.clear();
});

describe('ProfileForm', () => {
	it('«Редактировать» разблокирует поля и заменяет кнопку на «Отменить»', async () => {
		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		expect(screen.getByLabelText('Имя')).toHaveAttribute('readonly');
		expect(
			screen.queryByRole('button', { name: 'Отменить' }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Сохранить' }),
		).not.toBeInTheDocument();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));

		expect(screen.getByLabelText('Имя')).not.toHaveAttribute('readonly');
		expect(
			screen.getByRole('button', { name: 'Отменить' }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Редактировать' }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Сохранить' }),
		).not.toBeInTheDocument();
	});

	it('«Сохранить» появляется только после первого изменения поля', async () => {
		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));
		expect(
			screen.queryByRole('button', { name: 'Сохранить' }),
		).not.toBeInTheDocument();

		await editor.type(screen.getByLabelText('Имя'), 'ч');

		expect(
			await screen.findByRole('button', { name: 'Сохранить' }),
		).toBeInTheDocument();
	});

	it('«Отменить» возвращает в просмотр с исходными данными', async () => {
		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));
		const firstName = screen.getByLabelText('Имя');
		await editor.clear(firstName);
		await editor.type(firstName, 'Пётр');

		await editor.click(screen.getByRole('button', { name: 'Отменить' }));

		expect(
			screen.getByRole('button', { name: 'Редактировать' }),
		).toBeInTheDocument();
		expect(screen.getByLabelText('Имя')).toHaveAttribute('readonly');
		expect(screen.getByLabelText('Имя')).toHaveValue('Алексей');
		expect(
			screen.queryByRole('button', { name: 'Сохранить' }),
		).not.toBeInTheDocument();
	});

	it('пустое имя: видна ошибка и «Сохранить» неактивна', async () => {
		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));
		await editor.clear(screen.getByLabelText('Имя'));

		expect(await screen.findByText('Введите имя')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
	});

	it('конфликт email: показывает сообщение и оставляет карточку в режиме редактирования', async () => {
		mockedHttp.mockResolvedValueOnce([
			{
				id: 'user-2',
				firstName: 'Мария',
				lastName: 'Петрова',
				email: 'maria@formcraft.dev',
				password: 'password123',
			},
		]);

		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));
		const email = screen.getByLabelText('Email');
		await editor.clear(email);
		await editor.type(email, 'maria@formcraft.dev');
		await editor.click(screen.getByRole('button', { name: 'Сохранить' }));

		expect(
			await screen.findByText('Введенный Email уже занят'),
		).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).not.toHaveAttribute('readonly');
		expect(
			screen.getByRole('button', { name: 'Отменить' }),
		).toBeInTheDocument();
		// при конфликте PATCH не должен уходить — только запрос проверки email
		expect(mockedHttp).toHaveBeenCalledTimes(1);
	});

	it('успешное сохранение возвращает в просмотр с обновлёнными данными', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url.startsWith('/api/users?email=')) return [];
			if (init?.method === 'PATCH') {
				return {
					id: 'user-1',
					firstName: 'Алексей',
					lastName: 'Сидоров',
					email: 'alex@formcraft.dev',
					password: 'password123',
				};
			}
			throw new Error(`unexpected ${url}`);
		});

		renderWithProviders(<ProfileForm user={user} />);
		const editor = userEvent.setup();

		await editor.click(screen.getByRole('button', { name: 'Редактировать' }));
		const lastName = screen.getByLabelText('Фамилия');
		await editor.clear(lastName);
		await editor.type(lastName, 'Сидоров');
		await editor.click(screen.getByRole('button', { name: 'Сохранить' }));

		await waitFor(() =>
			expect(
				screen.getByRole('button', { name: 'Редактировать' }),
			).toBeInTheDocument(),
		);
		expect(screen.getByLabelText('Фамилия')).toHaveValue('Сидоров');
		expect(screen.getByLabelText('Фамилия')).toHaveAttribute('readonly');
		expect(
			screen.queryByRole('button', { name: 'Сохранить' }),
		).not.toBeInTheDocument();
	});
});
