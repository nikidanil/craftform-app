import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { DeleteFormButton } from '../ui/DeleteFormButton';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

describe('DeleteFormButton', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('в режиме iconOnly показывает иконку без текста и удаляет форму по клику', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			if (init?.method === 'DELETE') return undefined;
			return undefined;
		});

		renderWithProviders(<DeleteFormButton formId='form-1' iconOnly />);

		expect(screen.queryByText('Удалить форму')).not.toBeInTheDocument();

		const button = screen.getByRole('button', { name: 'Удалить форму' });
		await userEvent.click(button);

		await waitFor(() => {
			expect(mockedHttp).toHaveBeenCalledWith(
				'/api/forms/form-1',
				expect.objectContaining({ method: 'DELETE' }),
			);
		});
	});

	it('по умолчанию показывает текст «Удалить форму» рядом с иконкой', () => {
		renderWithProviders(<DeleteFormButton formId='form-1' />);

		expect(screen.getByText('Удалить форму')).toBeInTheDocument();
	});
});
