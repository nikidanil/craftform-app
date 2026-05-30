import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { useForm } from '@/entities/form';
import { HttpError } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { FormFillPage } from '../FormFillPage';

vi.mock('@/entities/form', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/form')>();
	return { ...actual, useForm: vi.fn() };
});

const mockedUseForm = vi.mocked(useForm);

type UseFormResult = ReturnType<typeof useForm>;

const mockQueryResult = (overrides: Partial<UseFormResult>): UseFormResult =>
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

describe('FormFillPage', () => {
	beforeEach(() => {
		mockedUseForm.mockReset();
	});

	it('пока форма грузится — пользователь видит индикатор загрузки', async () => {
		mockedUseForm.mockReturnValue(
			mockQueryResult({ isLoading: true, status: 'pending' }),
		);

		renderWithProviders(<FormFillPage />, {
			initialEntries: ['/forms/form-1'],
			routePath: '/forms/:formId',
		});

		await waitFor(() =>
			expect(screen.getByText('Загружаем форму…')).toBeInTheDocument(),
		);
	});

	it('если форма не найдена — пользователь видит сообщение «Форма не найдена»', async () => {
		mockedUseForm.mockReturnValue(
			mockQueryResult({
				error: new HttpError(404, 'Not Found'),
				isError: true,
				status: 'error',
			}),
		);

		renderWithProviders(<FormFillPage />, {
			initialEntries: ['/forms/missing'],
			routePath: '/forms/:formId',
		});

		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent('Форма не найдена'),
		);
	});

	it('при сетевой или серверной ошибке — пользователь видит общее сообщение об ошибке', async () => {
		mockedUseForm.mockReturnValue(
			mockQueryResult({
				error: new HttpError(500, 'Internal Server Error'),
				isError: true,
				status: 'error',
			}),
		);

		renderWithProviders(<FormFillPage />, {
			initialEntries: ['/forms/form-1'],
			routePath: '/forms/:formId',
		});

		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent(
				'Не удалось загрузить форму. Попробуйте обновить страницу.',
			),
		);
	});
});
