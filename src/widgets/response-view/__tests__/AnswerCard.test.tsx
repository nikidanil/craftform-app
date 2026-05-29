import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import type { Question } from '@/entities/form';
import type { Answer } from '@/entities/submission';

import { AnswerCard } from '../ui/AnswerCard';

const shortQuestion: Question = {
	id: 'q-1',
	type: 'short-text',
	body: 'Как вас зовут?',
	required: true,
	order: 0,
};

const longQuestion: Question = {
	id: 'q-2',
	type: 'long-text',
	body: 'Что понравилось?',
	required: false,
	order: 1,
};

const choiceQuestion: Question = {
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
};

const buildAnswer = (value: Answer['value'], questionId: string): Answer => ({
	questionId,
	value,
});

describe('AnswerCard', () => {
	it('если ответ отсутствует — показывает прочерк «—» вместо значения', () => {
		render(
			<AnswerCard question={shortQuestion} answer={undefined} index={0} />,
		);

		expect(screen.getByText('—')).toBeInTheDocument();
		expect(screen.queryByRole('list')).not.toBeInTheDocument();
	});

	it('для choice/single показывает только выбранный вариант, остальные скрыты', () => {
		const singleChoiceQuestion: Question = {
			...choiceQuestion,
			choiceVariant: 'single',
		};

		render(
			<AnswerCard
				question={singleChoiceQuestion}
				answer={buildAnswer(['o-2'], 'q-3')}
				index={2}
			/>,
		);

		const list = screen.getByRole('list');
		expect(within(list).getByText('Текст')).toBeInTheDocument();
		expect(within(list).queryAllByRole('listitem')).toHaveLength(1);
		expect(within(list).queryByText('Видео')).not.toBeInTheDocument();
	});

	it('для choice/multiple показывает все выбранные варианты и только их', () => {
		render(
			<AnswerCard
				question={choiceQuestion}
				answer={buildAnswer(['o-1', 'o-3'], 'q-3')}
				index={2}
			/>,
		);

		const list = screen.getByRole('list');
		const items = within(list).getAllByRole('listitem');
		expect(items.map((item) => item.textContent?.trim())).toEqual([
			'Видео',
			'Воркшопы',
		]);
		expect(within(list).queryByText('Текст')).not.toBeInTheDocument();
	});

	it('для long-text отображает полный текст ответа без усечения', () => {
		const longText =
			'Понравились примеры из реальных проектов и подача материала.';
		render(
			<AnswerCard
				question={longQuestion}
				answer={buildAnswer(longText, 'q-2')}
				index={1}
			/>,
		);

		expect(screen.getByText(longText)).toBeInTheDocument();
	});
});
