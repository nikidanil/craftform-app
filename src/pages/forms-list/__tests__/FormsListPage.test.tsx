import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import type { Form } from '@/entities/form';
import { useFormsList } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { useDeleteFormAction } from '@/features/delete-form/model/useDeleteFormAction';
import { renderWithProviders } from '@/test/test-utils';

import { FormsListPage } from '../FormsListPage';

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

const buildForm = (id: string, title: string): Form => ({
	id,
	title,
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
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
});
