import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { FormBuilderForm } from '../ui/FormBuilderForm';
import type { Form } from '@/entities/form';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const renderCreate = () =>
	renderWithProviders(<FormBuilderForm mode='create' />, {
		initialEntries: ['/forms/new'],
	});

describe('FormBuilderForm — create mode', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('«Сохранить» disabled, пока title пуст или нет вопросов; кнопка ссылки выключена до сохранения', async () => {
		const user = userEvent.setup();
		renderCreate();

		expect(screen.queryAllByTestId('question-card')).toHaveLength(0);
		expect(
			screen.getByRole('button', { name: /скопировать ссылку/i }),
		).toBeDisabled();

		const saveBtn = screen.getByRole('button', { name: /сохранить форму/i });
		expect(saveBtn).toBeDisabled();

		await user.type(screen.getByLabelText('Название формы'), 'Опрос');
		expect(saveBtn).toBeDisabled();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		expect(saveBtn).not.toBeDisabled();
	});

	it('клик по плиткам типов добавляет карточки соответствующих типов', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.click(screen.getByRole('button', { name: 'Длинный текст' }));
		await user.click(screen.getByRole('button', { name: 'Список выбора' }));

		const cards = screen.getAllByTestId('question-card');
		expect(cards).toHaveLength(3);
		expect(cards[0]).toHaveAttribute('data-type', 'short-text');
		expect(cards[1]).toHaveAttribute('data-type', 'long-text');
		expect(cards[2]).toHaveAttribute('data-type', 'choice');
	});

	it('в карточке choice можно переключить вариант между single и multiple', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Список выбора' }));

		const card = screen.getByTestId('question-card');
		const single = within(card).getByRole('button', {
			name: 'Один вариант',
		});
		const multiple = within(card).getByRole('button', {
			name: 'Несколько вариантов',
		});

		expect(single).toHaveAttribute('aria-pressed', 'true');
		expect(multiple).toHaveAttribute('aria-pressed', 'false');

		await user.click(multiple);
		expect(multiple).toHaveAttribute('aria-pressed', 'true');
		expect(single).toHaveAttribute('aria-pressed', 'false');
	});

	it('в карточке choice можно добавить новый вариант ответа', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Список выбора' }));
		const card = screen.getByTestId('question-card');
		const initialOptions = within(card).getAllByLabelText(/вариант ответа/i);

		await user.click(
			within(card).getByRole('button', { name: /добавить вариант/i }),
		);

		const afterOptions = within(card).getAllByLabelText(/вариант ответа/i);
		expect(afterOptions.length).toBe(initialOptions.length + 1);
	});

	it('кнопка «Удалить» в карточке убирает её из списка', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.click(screen.getByRole('button', { name: 'Длинный текст' }));
		expect(screen.getAllByTestId('question-card')).toHaveLength(2);

		const firstCard = screen.getAllByTestId('question-card')[0]!;
		await user.click(
			within(firstCard).getByRole('button', { name: /удалить вопрос/i }),
		);

		const cards = screen.getAllByTestId('question-card');
		expect(cards).toHaveLength(1);
		expect(cards[0]).toHaveAttribute('data-type', 'long-text');
	});

	it('кнопки «Переместить вверх/вниз» меняют порядок карточек и отключаются на крайних', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.click(screen.getByRole('button', { name: 'Длинный текст' }));
		await user.click(screen.getByRole('button', { name: 'Список выбора' }));

		const upFirst = screen.getByRole('button', {
			name: 'Переместить вопрос 1 вверх',
		});
		const downLast = screen.getByRole('button', {
			name: 'Переместить вопрос 3 вниз',
		});
		expect(upFirst).toBeDisabled();
		expect(downLast).toBeDisabled();

		await user.click(
			screen.getByRole('button', { name: 'Переместить вопрос 1 вниз' }),
		);

		const reordered = screen.getAllByTestId('question-card');
		expect(reordered[0]).toHaveAttribute('data-type', 'long-text');
		expect(reordered[1]).toHaveAttribute('data-type', 'short-text');
		expect(reordered[2]).toHaveAttribute('data-type', 'choice');
	});

	it('после удаления карточки фокус переезжает на соседнюю карточку', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.click(screen.getByRole('button', { name: 'Длинный текст' }));

		const firstCard = screen.getAllByTestId('question-card')[0]!;
		await user.click(
			within(firstCard).getByRole('button', { name: /удалить вопрос/i }),
		);

		const remainingCard = screen.getByTestId('question-card');
		const body = within(remainingCard).getByLabelText('Текст вопроса');
		expect(body).toHaveFocus();
	});

	it('handle перетаскивания — focusable кнопка с описательной aria-label', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));

		const handle = screen.getByRole('button', {
			name: 'Перетащить вопрос 1',
		});
		handle.focus();
		expect(handle).toHaveFocus();
	});

	it('после удаления единственной карточки фокус возвращается на поле «Название формы»', async () => {
		const user = userEvent.setup();
		renderCreate();

		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.click(
			screen.getByRole('button', { name: /удалить вопрос/i }),
		);

		expect(screen.getByLabelText('Название формы')).toHaveFocus();
	});
});

const fullForm: Form = {
	id: 'form-1',
	authorId: 'author-1',
	title: 'Обратная связь',
	description: 'Помогите нам стать лучше',
	createdAt: '2026-04-15T10:00:00.000Z',
	questions: [
		{
			id: 'q-1',
			type: 'short-text',
			body: 'Как вас зовут?',
			required: true,
			order: 0,
		},
		{
			id: 'q-3',
			type: 'choice',
			body: 'Формат?',
			required: true,
			order: 1,
			choiceVariant: 'multiple',
			options: [
				{ id: 'o-1', label: 'Видео' },
				{ id: 'o-2', label: 'Текст' },
			],
		},
	],
};

describe('FormBuilderForm — edit mode', () => {
	beforeEach(() => mockedHttp.mockReset());

	it('предзаполненные данные формы можно изменить; кнопка «Скопировать ссылку» активна в edit-режиме', async () => {
		const user = userEvent.setup();
		renderWithProviders(<FormBuilderForm mode='edit' form={fullForm} />, {
			initialEntries: ['/forms/form-1/edit'],
		});

		const titleField = screen.getByLabelText('Название формы');
		expect(titleField).toHaveValue('Обратная связь');
		const descField = screen.getByLabelText('Описание формы');
		expect(descField).toHaveValue('Помогите нам стать лучше');

		const cards = screen.getAllByTestId('question-card');
		expect(cards).toHaveLength(2);
		expect(within(cards[0]!).getByLabelText('Текст вопроса')).toHaveValue(
			'Как вас зовут?',
		);
		expect(cards[1]).toHaveAttribute('data-type', 'choice');

		expect(
			screen.getByRole('button', { name: /скопировать ссылку/i }),
		).not.toBeDisabled();

		await user.clear(titleField);
		await user.type(titleField, 'Новое название');
		expect(titleField).toHaveValue('Новое название');
	});
});
