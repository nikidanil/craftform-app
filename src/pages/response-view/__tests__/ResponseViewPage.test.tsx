import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import type { Form } from '@/entities/form';
import type { Submission } from '@/entities/submission';
import { useForm } from '@/entities/form';
import { useResponse } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';

import { ResponseViewPage } from '../ResponseViewPage';

vi.mock('@/entities/form', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/form')>();
	return { ...actual, useForm: vi.fn() };
});

vi.mock('@/entities/submission', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('@/entities/submission')>();
	return { ...actual, useResponse: vi.fn() };
});

const mockedUseForm = vi.mocked(useForm);
const mockedUseResponse = vi.mocked(useResponse);

type UseFormResult = ReturnType<typeof useForm>;
type UseResponseResult = ReturnType<typeof useResponse>;

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

const mockResponseResult = (
	overrides: Partial<UseResponseResult>,
): UseResponseResult =>
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
	}) as UseResponseResult;

const form: Form = {
	id: 'form-1',
	authorId: 'author-1',
	title: 'Обратная связь',
	description: '',
	createdAt: '2026-04-15T10:00:00.000Z',
	questions: [
		{
			id: 'q-1',
			type: 'short-text',
			body: 'Как вас зовут?',
			required: true,
			order: 0,
		},
	],
};

const submission: Submission = {
	id: 'r-1',
	formId: 'form-1',
	number: 1,
	createdAt: '2025-05-02T14:32:00',
	answers: [{ questionId: 'q-1', value: 'Анна' }],
};

const renderPage = () =>
	renderWithProviders(<ResponseViewPage />, {
		initialEntries: ['/forms/form-1/responses/r-1'],
		routePath: '/forms/:formId/responses/:responseId',
	});

describe('ResponseViewPage', () => {
	beforeEach(() => {
		mockedUseForm.mockReset();
		mockedUseResponse.mockReset();
	});

	it('пока данные грузятся — пользователь видит индикатор', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({ isLoading: true, status: 'pending' }),
		);
		mockedUseResponse.mockReturnValue(
			mockResponseResult({ isLoading: true, status: 'pending' }),
		);

		renderPage();

		expect(screen.getByText('Загружаем отклик…')).toBeInTheDocument();
	});

	it('если отклик не найден (404) — пользователь видит сообщение «Отклик не найден»', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				data: form,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponse.mockReturnValue(
			mockResponseResult({
				error: new HttpError(404, 'Not Found'),
				isError: true,
				status: 'error',
			}),
		);

		renderPage();

		expect(screen.getByRole('alert')).toHaveTextContent('Отклик не найден');
	});

	it('если форма не найдена (404) — то же сообщение «Отклик не найден»', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				error: new HttpError(404, 'Not Found'),
				isError: true,
				status: 'error',
			}),
		);
		mockedUseResponse.mockReturnValue(
			mockResponseResult({
				data: submission,
				isSuccess: true,
				status: 'success',
			}),
		);

		renderPage();

		expect(screen.getByRole('alert')).toHaveTextContent('Отклик не найден');
	});

	it('при общей ошибке — пользователь видит общее сообщение', () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				data: form,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponse.mockReturnValue(
			mockResponseResult({
				error: new HttpError(500, 'Internal Server Error'),
				isError: true,
				status: 'error',
			}),
		);

		renderPage();

		expect(screen.getByRole('alert')).toHaveTextContent(
			'Не удалось загрузить отклик. Попробуйте обновить страницу.',
		);
	});

	it('happy path: видны ответ и клик «Перейти к форме» ведёт на /forms/:formId', async () => {
		mockedUseForm.mockReturnValue(
			mockFormResult({
				data: form,
				isSuccess: true,
				status: 'success',
			}),
		);
		mockedUseResponse.mockReturnValue(
			mockResponseResult({
				data: submission,
				isSuccess: true,
				status: 'success',
			}),
		);

		const { getCurrentPath } = renderPage();

		expect(
			screen.getByRole('heading', { level: 1, name: 'Отклик №1' }),
		).toBeInTheDocument();
		expect(screen.getByText('Анна')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /Перейти к форме/ }),
		);
		expect(getCurrentPath()).toBe('/forms/form-1');
	});
});
