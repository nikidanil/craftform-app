import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import type { Form } from '@/entities/form';
import type { Submission } from '@/entities/submission';
import { useForm } from '@/entities/form';
import { useResponsesList } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';

import { ResponsesListPage } from '../ResponsesListPage';

vi.mock('@/entities/form', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/form')>();
	return { ...actual, useForm: vi.fn() };
});

vi.mock('@/entities/submission', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('@/entities/submission')>();
	return { ...actual, useResponsesList: vi.fn() };
});

const mockedUseForm = vi.mocked(useForm);
const mockedUseResponsesList = vi.mocked(useResponsesList);

type UseFormResult = ReturnType<typeof useForm>;
type UseResponsesResult = ReturnType<typeof useResponsesList>;

const mockFormResult = (overrides: Partial<UseFormResult>): UseFormResult =>
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
	}) as UseFormResult;

const mockResponsesResult = (
	overrides: Partial<UseResponsesResult>,
): UseResponsesResult =>
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
	}) as UseResponsesResult;

const buildForm = (overrides: Partial<Form> = {}): Form => ({
	id: 'form-1',
	title: 'Обратная связь',
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
	...overrides,
});

const buildSubmission = (overrides: Partial<Submission> = {}): Submission => ({
	id: 'r-1',
	formId: 'form-1',
	number: 1,
	createdAt: '2025-05-02T14:32:00',
	answers: [],
	...overrides,
});

const renderPage = () =>
	renderWithProviders(<ResponsesListPage />, {
		initialEntries: ['/forms/form-1/responses'],
		routePath: '/forms/:formId/responses',
	});

describe('ResponsesListPage', () => {
	beforeEach(() => {
		mockedUseForm.mockReset();
		mockedUseResponsesList.mockReset();
	});

	it('пока данные грузятся — пользователь видит индикатор', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({ isLoading: true, status: 'pending' }),
		);
		mockedUseResponsesList.mockReturnValue(
			mockResponsesResult({ isLoading: true, status: 'pending' }),
		);

		renderPage();

		expect(screen.getByText('Загружаем отклики…')).toBeInTheDocument();
	});

	it('если форма не найдена — пользователь видит сообщение «Форма не найдена»', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				error: new HttpError(404, 'Not Found'),
				isError: true,
				status: 'error',
			}),
		);
		mockedUseResponsesList.mockReturnValue(mockResponsesResult({}));

		renderPage();

		expect(screen.getByRole('alert')).toHaveTextContent('Форма не найдена');
	});

	it('при общей ошибке — пользователь видит общее сообщение', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				data: buildForm(),
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesList.mockReturnValue(
			mockResponsesResult({
				error: new HttpError(500, 'Internal Server Error'),
				isError: true,
				status: 'error',
			}),
		);

		renderPage();

		expect(screen.getByRole('alert')).toHaveTextContent(
			'Не удалось загрузить отклики. Попробуйте обновить страницу.',
		);
	});

	it('два отклика → клик по карточке ведёт на /forms/:formId/responses/:responseId', async () => {
		const responses = [
			buildSubmission({ id: 'r-1', formId: 'form-1', number: 1 }),
			buildSubmission({ id: 'r-2', formId: 'form-1', number: 2 }),
		];

		mockedUseForm.mockReturnValue(
			mockFormResult({
				data: buildForm({ title: 'Опрос' }),
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponsesList.mockReturnValue(
			mockResponsesResult({
				data: responses,
				isSuccess: true,
				status: 'success',
			}),
		);

		const { getCurrentPath } = renderPage();

		expect(
			screen.getByRole('heading', { level: 1, name: 'Отклики' }),
		).toBeInTheDocument();
		expect(screen.getByText('Опрос')).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: /Отклик №2/ }));
		expect(getCurrentPath()).toBe('/forms/form-1/responses/r-2');
	});
});
