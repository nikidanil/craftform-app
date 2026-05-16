import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/test-utils';
import type { Form } from '@/entities/form';
import { FormCard } from '../ui/FormCard';

const buildForm = (overrides: Partial<Form> = {}): Form => ({
	id: 'form-1',
	title: 'Опрос',
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
	...overrides,
});

describe('FormCard', () => {
	it('клик по «Редактировать» ведёт на /forms/:id/edit; счётчик откликов виден перед кликом', async () => {
		const form = buildForm({ id: 'form-7' });

		const { getCurrentPath } = renderWithProviders(
			<FormCard form={form} responsesCount={42} />,
		);

		expect(screen.getByText('42 отклика')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /Редактировать/ }),
		);
		expect(getCurrentPath()).toBe('/forms/form-7/edit');
	});

	it('клик по «Отклики» ведёт на /forms/:id/responses', async () => {
		const form = buildForm({ id: 'form-7' });

		const { getCurrentPath } = renderWithProviders(
			<FormCard form={form} responsesCount={0} />,
		);

		await userEvent.click(screen.getByRole('link', { name: /Отклики/ }));
		expect(getCurrentPath()).toBe('/forms/form-7/responses');
	});
});
