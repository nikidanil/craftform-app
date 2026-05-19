import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '@/test/test-utils';
import type { Submission } from '@/entities/submission';
import { ResponsesList } from '../ui/ResponsesList';

const buildSubmission = (overrides: Partial<Submission> = {}): Submission => ({
	id: 'r-1',
	formId: 'form-1',
	number: 1,
	createdAt: '2025-05-02T14:32:00',
	answers: [],
	...overrides,
});

describe('ResponsesList', () => {
	it('рендерит список откликов с бейджем счётчика и переходит по карточке', async () => {
		const responses: Submission[] = [
			buildSubmission({ id: 'r-1', formId: 'form-7', number: 1 }),
			buildSubmission({ id: 'r-2', formId: 'form-7', number: 2 }),
		];

		const { getCurrentPath } = renderWithProviders(
			<ResponsesList formTitle='Обратная связь' responses={responses} />,
		);

		expect(
			screen.getByRole('heading', { level: 1, name: 'Отклики' }),
		).toBeInTheDocument();
		expect(screen.getByText('Форма:')).toBeInTheDocument();
		expect(screen.getByText('Обратная связь')).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();

		const list = screen.getByRole('list', { name: /Список откликов/ });
		expect(within(list).getAllByRole('link')).toHaveLength(2);
		expect(
			screen.queryByText('Для данной формы нет откликов'),
		).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: /Отклик №2/ }));
		expect(getCurrentPath()).toBe('/forms/form-7/responses/r-2');
	});

	it('после удаления всех откликов список заменяется на EmptyState', () => {
		const initial: Submission[] = [
			buildSubmission({ id: 'r-1', formId: 'form-7', number: 1 }),
			buildSubmission({ id: 'r-2', formId: 'form-7', number: 2 }),
		];

		const { rerender } = renderWithProviders(
			<ResponsesList formTitle='Опрос' responses={initial} />,
		);

		expect(
			screen.getByRole('list', { name: /Список откликов/ }),
		).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();
		expect(
			screen.queryByText('Для данной формы нет откликов'),
		).not.toBeInTheDocument();

		rerender(<ResponsesList formTitle='Опрос' responses={[]} />);

		expect(screen.queryByRole('list', { name: /Список откликов/ })).toBeNull();
		expect(screen.getByText('0 откликов')).toBeInTheDocument();
		expect(
			screen.getByText('Для данной формы нет откликов'),
		).toBeInTheDocument();
	});
});
