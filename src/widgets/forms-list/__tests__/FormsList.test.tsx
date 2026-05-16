import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/test-utils';
import type { Form } from '@/entities/form';
import { FormsList } from '../ui/FormsList';

const buildForm = (id: string, title: string): Form => ({
	id,
	title,
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
});

describe('FormsList', () => {
	it('пустой список форм → видно сообщение и клик по CTA ведёт на /forms/new', async () => {
		const { getCurrentPath } = renderWithProviders(
			<FormsList forms={[]} responsesCountByForm={{}} />,
		);

		expect(
			screen.getByText('У вас пока нет форм. Создайте первую'),
		).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: 'Создать форму' }),
		);
		expect(getCurrentPath()).toBe('/forms/new');
	});

	it('две формы → видны обе карточки со счётчиками, клик по «Создать новую форму» ведёт на /forms/new', async () => {
		const forms = [
			buildForm('form-1', 'Опрос A'),
			buildForm('form-2', 'Опрос B'),
		];

		const { getCurrentPath } = renderWithProviders(
			<FormsList
				forms={forms}
				responsesCountByForm={{ 'form-1': 2, 'form-2': 0 }}
			/>,
		);

		expect(
			screen.getByRole('heading', { name: 'Опрос A' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: 'Опрос B' }),
		).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();
		expect(screen.getByText('0 откликов')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /Создать новую форму/ }),
		);
		expect(getCurrentPath()).toBe('/forms/new');
	});
});
