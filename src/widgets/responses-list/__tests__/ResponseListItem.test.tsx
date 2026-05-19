import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/test-utils';
import type { Submission } from '@/entities/submission';
import { ResponseListItem } from '../ui/ResponseListItem';

const buildSubmission = (overrides: Partial<Submission> = {}): Submission => ({
	id: 'r-1',
	formId: 'form-1',
	number: 1,
	createdAt: '2025-05-02T14:32:00',
	answers: [],
	...overrides,
});

describe('ResponseListItem', () => {
	it('клик по карточке ведёт на /forms/:formId/responses/:responseId', async () => {
		const submission = buildSubmission({
			id: 'r-42',
			formId: 'form-7',
			number: 42,
		});

		const { getCurrentPath } = renderWithProviders(
			<ResponseListItem submission={submission} />,
		);

		expect(
			screen.getByRole('heading', { name: 'Отклик №42' }),
		).toBeInTheDocument();
		expect(screen.getByText('02.05.2025, 14:32')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /Отклик №42/ }),
		);
		expect(getCurrentPath()).toBe('/forms/form-7/responses/r-42');
	});
});
