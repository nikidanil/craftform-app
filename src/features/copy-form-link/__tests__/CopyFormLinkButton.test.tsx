import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastViewport } from '@/shared/ui';
import { CopyFormLinkButton } from '../ui/CopyFormLinkButton';

describe('CopyFormLinkButton', () => {
	const writeText = vi.fn<(text: string) => Promise<void>>();

	beforeEach(() => {
		writeText.mockReset();
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});
	});

	it('после клика показывает тост «Ссылка скопирована»', async () => {
		writeText.mockResolvedValue(undefined);
		render(
			<>
				<CopyFormLinkButton formId='form-42' />
				<ToastViewport />
			</>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Скопировать ссылку' }),
		);

		expect(await screen.findByText('Ссылка скопирована')).toBeInTheDocument();
	});

	it('при ошибке копирования показывает тост ошибки', async () => {
		writeText.mockRejectedValue(new Error('clipboard denied'));
		render(
			<>
				<CopyFormLinkButton formId='form-42' />
				<ToastViewport />
			</>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Скопировать ссылку' }),
		);

		expect(
			await screen.findByText('Не удалось скопировать ссылку'),
		).toBeInTheDocument();
	});
});
