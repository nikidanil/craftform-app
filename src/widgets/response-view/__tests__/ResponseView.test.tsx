import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import type { Form } from '@/entities/form';
import type { Submission } from '@/entities/submission';
import { renderWithProviders } from '@/test/test-utils';

import { ResponseView } from '../ui/ResponseView';

const form: Form = {
	id: 'form-1',
	authorId: 'author-1',
	title: 'Обратная связь по курсу',
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
			id: 'q-2',
			type: 'long-text',
			body: 'Что понравилось?',
			required: false,
			order: 1,
		},
		{
			id: 'q-3',
			type: 'choice',
			body: 'Какой формат ближе?',
			required: true,
			order: 2,
			choiceVariant: 'multiple',
			options: [
				{ id: 'o-1', label: 'Видео' },
				{ id: 'o-2', label: 'Текст' },
				{ id: 'o-3', label: 'Воркшопы' },
			],
		},
	],
};

const submission: Submission = {
	id: 'r-1',
	formId: 'form-1',
	number: 1,
	createdAt: '2025-05-02T14:32:00',
	answers: [
		{ questionId: 'q-1', value: 'Анна' },
		{ questionId: 'q-2', value: 'Понравились примеры из реальных проектов' },
		{ questionId: 'q-3', value: ['o-1', 'o-3'] },
	],
};

describe('ResponseView', () => {
	it('пользователь просматривает отклик и переходит в список откликов по хлебным крошкам', async () => {
		const { getCurrentPath } = renderWithProviders(
			<ResponseView form={form} submission={submission} />,
		);

		expect(
			screen.getByRole('heading', { level: 1, name: 'Отклик №1' }),
		).toBeInTheDocument();
		expect(screen.getByText('02.05.2025, 14:32')).toBeInTheDocument();
		expect(screen.getByText('Обратная связь по курсу')).toBeInTheDocument();

		expect(screen.getByText('Анна')).toBeInTheDocument();
		expect(
			screen.getByText('Понравились примеры из реальных проектов'),
		).toBeInTheDocument();
		expect(screen.getByText('Видео')).toBeInTheDocument();
		expect(screen.getByText('Воркшопы')).toBeInTheDocument();
		expect(screen.queryByText('Текст')).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: 'Отклики' }));
		expect(getCurrentPath()).toBe('/forms/form-1/responses');
	});

	it('клик по «Перейти к форме» ведёт на публичную страницу формы', async () => {
		renderWithProviders(<ResponseView form={form} submission={submission} />);

		const goToForm = screen.getByRole('link', { name: /Перейти к форме/ });
		expect(goToForm).toHaveAttribute('href', '/forms/form-1');
	});
});
