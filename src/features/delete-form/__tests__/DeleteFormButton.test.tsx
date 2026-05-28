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
		mockedHttp.mockImplementation(async (url, init) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			if (init?.method === 'DELETE') return undefined;
			return undefined;
		});
	});

	it('удаляет форму только после подтверждения в диалоге', async () => {
		renderWithProviders(<DeleteFormButton formId='form-1' />);

		await userEvent.click(
			screen.getByRole('button', { name: /Удалить форму/ }),
		);

		expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
		expect(mockedHttp).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

		await waitFor(() => {
			expect(mockedHttp).toHaveBeenCalledWith(
				'/api/forms/form-1',
				expect.objectContaining({ method: 'DELETE' }),
			);
		});
	});

	it('«Отмена» закрывает диалог и не удаляет форму', async () => {
		renderWithProviders(<DeleteFormButton formId='form-2' />);

		await userEvent.click(
			screen.getByRole('button', { name: /Удалить форму/ }),
		);
		await screen.findByRole('alertdialog');

		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));

		await waitFor(() =>
			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
		);
		expect(mockedHttp).not.toHaveBeenCalled();
	});

	it('при ошибке удаления диалог остаётся открытым и показывает сообщение', async () => {
		mockedHttp.mockImplementation(async (url: string, init?: RequestInit) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			if (init?.method === 'DELETE') throw new Error('Не удалось удалить форму');
			return undefined;
		});
		renderWithProviders(<DeleteFormButton formId='form-err' />);

		await userEvent.click(screen.getByRole('button', { name: /Удалить форму/ }));
		await screen.findByRole('alertdialog');

		await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

		await waitFor(() =>
			expect(screen.getByRole('alertdialog')).toBeInTheDocument(),
		);
		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось удалить форму');
	});

	it('в режиме iconOnly триггер без текста открывает диалог по клику', async () => {
		renderWithProviders(<DeleteFormButton formId='form-1' iconOnly />);

		expect(screen.queryByText('Удалить форму')).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('button', { name: 'Удалить форму' }),
		);

		expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
	});
});
