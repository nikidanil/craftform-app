import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSubmitResponseAction, type SubmitStatus } from '@/features/submit-response';
import { renderWithProviders } from '@/test/test-utils';
import { FormFillForm } from '../ui/FormFillForm';
import type { Form } from '@/entities/form';

vi.mock('@/features/submit-response', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/features/submit-response')>();
	return { ...actual, useSubmitResponseAction: vi.fn() };
});

const mockedUseSubmitResponseAction = vi.mocked(useSubmitResponseAction);

const makeAction = (
	overrides: Partial<ReturnType<typeof useSubmitResponseAction>> = {},
) => {
	mockedUseSubmitResponseAction.mockReturnValue({
		submit: vi.fn(),
		status: 'idle',
		errorMessage: null,
		reset: vi.fn(),
		...overrides,
	} as ReturnType<typeof useSubmitResponseAction>);
};

const makeReactiveAction = (onSubmitEffect: (state: { status: SubmitStatus; errorMessage: string | null }) => void) => {
	const state = { status: 'idle' as SubmitStatus, errorMessage: null as string | null };
	mockedUseSubmitResponseAction.mockImplementation(() => ({
		submit: vi.fn(() => onSubmitEffect(state)),
		status: state.status,
		errorMessage: state.errorMessage,
		reset: vi.fn(),
	}));
};

const shortTextForm: Form = {
	id: 'form-1',
	authorId: 'author-1',
	title: 'Тестовая форма',
	description: 'Описание формы',
	createdAt: '2026-01-01T00:00:00.000Z',
	questions: [
		{ id: 'q-1', type: 'short-text', body: 'Ваше имя', required: true, order: 0 },
	],
};

const longTextForm: Form = {
	id: 'form-2',
	authorId: 'author-1',
	title: 'Форма с текстом',
	description: '',
	createdAt: '2026-01-01T00:00:00.000Z',
	questions: [
		{ id: 'q-2', type: 'long-text', body: 'Расскажите о себе', required: true, order: 0 },
	],
};

const radioForm: Form = {
	id: 'form-3',
	authorId: 'author-1',
	title: 'Форма с радио',
	description: '',
	createdAt: '2026-01-01T00:00:00.000Z',
	questions: [
		{
			id: 'q-3',
			type: 'choice',
			choiceVariant: 'single',
			body: 'Ваш город',
			required: true,
			order: 0,
			options: [
				{ id: 'opt-1', label: 'Москва' },
				{ id: 'opt-2', label: 'СПб' },
			],
		},
	],
};

const checkboxForm: Form = {
	id: 'form-4',
	authorId: 'author-1',
	title: 'Форма с чекбоксами',
	description: '',
	createdAt: '2026-01-01T00:00:00.000Z',
	questions: [
		{
			id: 'q-4',
			type: 'choice',
			choiceVariant: 'multiple',
			body: 'Выберите интересы',
			required: true,
			order: 0,
			options: [
				{ id: 'opt-3', label: 'Спорт' },
				{ id: 'opt-4', label: 'Музыка' },
			],
		},
	],
};

describe('FormFillForm', () => {
	beforeEach(() => {
		mockedUseSubmitResponseAction.mockReset();
	});

	it('заполнение обязательного short-text поля активирует кнопку «Отправить»', async () => {
		makeAction();
		renderWithProviders(<FormFillForm form={shortTextForm} />);

		const submitButton = screen.getByRole('button', { name: /отправить/i });
		await waitFor(() => expect(submitButton).toBeDisabled());

		await userEvent.type(screen.getByLabelText(/ваше имя/i), 'Иван');

		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('заполнение обязательного long-text поля активирует кнопку «Отправить»', async () => {
		makeAction();
		renderWithProviders(<FormFillForm form={longTextForm} />);

		const submitButton = screen.getByRole('button', { name: /отправить/i });
		await waitFor(() => expect(submitButton).toBeDisabled());

		await userEvent.type(screen.getByLabelText(/расскажите о себе/i), 'Мой ответ');

		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('выбор варианта в обязательном radio-вопросе активирует кнопку «Отправить»', async () => {
		makeAction();
		renderWithProviders(<FormFillForm form={radioForm} />);

		const submitButton = screen.getByRole('button', { name: /отправить/i });
		await waitFor(() => expect(submitButton).toBeDisabled());

		await userEvent.click(screen.getByRole('radio', { name: /москва/i }));

		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('выбор чекбокса в обязательном multiple-вопросе активирует кнопку «Отправить»', async () => {
		makeAction();
		renderWithProviders(<FormFillForm form={checkboxForm} />);

		const submitButton = screen.getByRole('button', { name: /отправить/i });
		await waitFor(() => expect(submitButton).toBeDisabled());

		await userEvent.click(screen.getByRole('checkbox', { name: /спорт/i }));

		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('нажатие «Отправить» вызывает submit с данными формы', async () => {
		const mockSubmit = vi.fn();
		makeAction({ submit: mockSubmit });
		renderWithProviders(<FormFillForm form={shortTextForm} />);

		await userEvent.type(screen.getByLabelText(/ваше имя/i), 'Иван');
		await waitFor(() =>
			expect(screen.getByRole('button', { name: /отправить/i })).not.toBeDisabled(),
		);

		await userEvent.click(screen.getByRole('button', { name: /отправить/i }));

		await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ formId: shortTextForm.id }),
		);
	});

	it('после успешной отправки показывает экран успеха вместо формы', async () => {
		makeReactiveAction((state) => {
			state.status = 'success';
		});
		renderWithProviders(<FormFillForm form={shortTextForm} />);

		await userEvent.type(screen.getByLabelText(/ваше имя/i), 'Иван');
		await waitFor(() =>
			expect(screen.getByRole('button', { name: /отправить/i })).not.toBeDisabled(),
		);

		await userEvent.click(screen.getByRole('button', { name: /отправить/i }));

		await waitFor(() =>
			expect(screen.getByText(/спасибо за ответ/i)).toBeInTheDocument(),
		);
		expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
	});

	it('после ошибки отправки показывает сообщение над кнопкой', async () => {
		makeReactiveAction((state) => {
			state.status = 'error';
			state.errorMessage = 'Не удалось отправить отклик. Попробуйте ещё раз.';
		});
		renderWithProviders(<FormFillForm form={shortTextForm} />);

		await userEvent.type(screen.getByLabelText(/ваше имя/i), 'Иван');
		await waitFor(() =>
			expect(screen.getByRole('button', { name: /отправить/i })).not.toBeDisabled(),
		);

		await userEvent.click(screen.getByRole('button', { name: /отправить/i }));

		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent(/не удалось отправить/i),
		);
		expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
	});
});
