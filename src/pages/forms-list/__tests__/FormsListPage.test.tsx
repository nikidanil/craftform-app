import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import type { Form } from '@/entities/form';
import { useFormsList } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { useSessionStore } from '@/entities/session';
import { useDeleteFormAction } from '@/features/delete-form/model/useDeleteFormAction';
import { renderWithProviders } from '@/test/test-utils';

import { FormsListPage } from '../FormsListPage';

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

vi.mock('@/entities/form', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/form')>();
	return { ...actual, useFormsList: vi.fn() };
});

vi.mock('@/entities/submission', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('@/entities/submission')>();
	return { ...actual, useResponsesCountByForm: vi.fn() };
});

vi.mock('@/features/delete-form/model/useDeleteFormAction', () => ({
	useDeleteFormAction: vi.fn(),
}));

const mockedUseFormsList = vi.mocked(useFormsList);
const mockedUseResponsesCountByForm = vi.mocked(useResponsesCountByForm);
const mockedUseDeleteFormAction = vi.mocked(useDeleteFormAction);

type UseFormsListResult = ReturnType<typeof useFormsList>;
type UseCountResult = ReturnType<typeof useResponsesCountByForm>;
type QueryResultShape<T> = Pick<
	UseFormsListResult,
	'error' | 'isLoading' | 'isPending' | 'isError' | 'isSuccess' | 'fetchStatus'
> & { data: T | undefined; status: UseFormsListResult['status'] };

const mockQueryResult = <T,>(
	overrides: Partial<QueryResultShape<T>>,
): UseFormsListResult & UseCountResult =>
	({
		data: undefined,
		error: null,
		isLoading: false,
		isPending: false,
		isError: false,
		isSuccess: false,
		status: 'pending',
		fetchStatus: 'idle',
		...overrides,
	}) as UseFormsListResult & UseCountResult;

const buildForm = (
	id: string,
	title: string,
	authorId = 'user-1',
): Form => ({
	id,
	title,
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
	authorId,
});

const mockDeleteAction = (deleteForm = vi.fn().mockResolvedValue(undefined)) => {
	mockedUseDeleteFormAction.mockReturnValue({
		deleteForm,
		error: null,
		pending: false,
	});
	return deleteForm;
};

describe('FormsListPage', () => {
	beforeEach(() => {
		mockedUseFormsList.mockReset();
		mockedUseResponsesCountByForm.mockReset();
		mockedUseDeleteFormAction.mockReset();
		localStorage.clear();
		useSessionStore.setState({ currentUser: seedUser });
	});

	it('пока список грузится — пользователь видит индикатор', () => {
		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({ isLoading: true, status: 'pending' }),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({}),
		);
		mockDeleteAction();

		renderWithProviders(<FormsListPage />);

		expect(screen.getByText('Загружаем формы…')).toBeInTheDocument();
		expect(screen.queryAllByRole('article')).toHaveLength(0);
	});

	it('при пустом списке клик «Создать форму» ведёт на /forms/new', async () => {
		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: [],
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		const { getCurrentPath } = renderWithProviders(<FormsListPage />);

		expect(
			screen.getByText('У вас пока нет форм. Создайте первую'),
		).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: 'Создать форму' }),
		);
		expect(getCurrentPath()).toBe('/forms/new');
	});

	it('две формы → клик «Удалить» на одной вызывает удаление с правильным formId', async () => {
		const forms = [
			buildForm('form-1', 'Опрос A'),
			buildForm('form-2', 'Опрос B'),
		];

		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: forms,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: { 'form-1': 2, 'form-2': 0 },
				isSuccess: true,
				status: 'success',
			}),
		);
		const deleteForm = mockDeleteAction();

		renderWithProviders(<FormsListPage />);

		expect(screen.getByRole('heading', { name: 'Опрос A' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Опрос B' })).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();
		expect(screen.getByText('0 откликов')).toBeInTheDocument();

		const deleteButtons = screen.getAllByRole('button', {
			name: 'Удалить форму',
		});
		await userEvent.click(deleteButtons[1]);

		expect(deleteForm).toHaveBeenCalledWith('form-2');
	});

	it('при ошибке загрузки пользователь видит общее сообщение', () => {
		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				error: new Error('boom'),
				isError: true,
				status: 'error',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({}),
		);
		mockDeleteAction();

		renderWithProviders(<FormsListPage />);

		expect(screen.getByRole('alert')).toHaveTextContent(
			'Не удалось загрузить список форм. Попробуйте обновить страницу.',
		);
		expect(screen.queryAllByRole('article')).toHaveLength(0);
	});

	it('открытие по URL с ?q=...&sort=title-asc восстанавливает поле поиска, селект и видимые карточки', () => {
		const forms = [
			buildForm('form-1', 'Опрос про офис'),
			buildForm('form-2', 'Регистрация на митап'),
		];

		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: forms,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		renderWithProviders(<FormsListPage />, {
			initialEntries: ['/?q=Опрос&sort=title-asc'],
		});

		expect(
			screen.getByRole('searchbox', { name: /поиск форм/i }),
		).toHaveValue('Опрос');
		expect(
			screen.getByRole('combobox', { name: /сортировка/i }),
		).toHaveTextContent('По названию: А–Я');
		expect(
			screen.getByRole('heading', { name: 'Опрос про офис' }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole('heading', { name: 'Регистрация на митап' }),
		).toBeNull();
	});

	it('очистка поля поиска убирает q, но сохраняет sort в URL', async () => {
		const forms = [
			buildForm('form-1', 'Опрос про офис'),
			buildForm('form-2', 'Регистрация на митап'),
		];

		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: forms,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		const { getCurrentPath } = renderWithProviders(<FormsListPage />, {
			initialEntries: ['/?q=Опрос&sort=title-asc'],
		});

		await userEvent.clear(
			screen.getByRole('searchbox', { name: /поиск форм/i }),
		);

		expect(getCurrentPath()).toBe('/?sort=title-asc');
	});

	it('форма чужого автора не появляется в списке', () => {
		const forms = [
			buildForm('form-1', 'Моя форма', 'user-1'),
			buildForm('form-2', 'Чужая форма', 'user-2'),
		];

		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: forms,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		renderWithProviders(<FormsListPage />);

		expect(
			screen.getByRole('heading', { name: 'Моя форма' }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole('heading', { name: 'Чужая форма' }),
		).toBeNull();
	});

	it('показывает flash «Вы уже вошли в систему» из location.state', () => {
		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: [],
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		renderWithProviders(<FormsListPage />, {
			initialEntries: [
				{
					pathname: '/',
					state: { message: 'Вы уже вошли в систему' },
				},
			],
		});

		expect(
			screen.getByText('Вы уже вошли в систему'),
		).toBeInTheDocument();
	});

	it('невалидный sort в URL чистится до дефолта', async () => {
		const forms = [
			buildForm('form-1', 'Опрос про офис'),
			buildForm('form-2', 'Регистрация на митап'),
		];

		mockedUseFormsList.mockReturnValue(
			mockQueryResult<Form[]>({
				data: forms,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesCountByForm.mockReturnValue(
			mockQueryResult<Record<string, number>>({
				data: {},
				isSuccess: true,
				status: 'success',
			}),
		);
		mockDeleteAction();

		const { getCurrentPath } = renderWithProviders(<FormsListPage />, {
			initialEntries: ['/?sort=мусор'],
		});

		await waitFor(() => {
			expect(getCurrentPath()).toBe('/');
		});
		expect(
			screen.getByRole('combobox', { name: /сортировка/i }),
		).toHaveTextContent('Сначала новые');
	});
});
