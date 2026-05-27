import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyFormLinkButton } from '../ui/CopyFormLinkButton';

describe('CopyFormLinkButton', () => {
	it('клик по активной кнопке вызывает onCopy', async () => {
		const onCopy = vi.fn();
		render(<CopyFormLinkButton onCopy={onCopy} />);

		await userEvent.click(
			screen.getByRole('button', { name: 'Скопировать ссылку' }),
		);

		expect(onCopy).toHaveBeenCalledTimes(1);
	});

	it('в состоянии disabled клик не вызывает onCopy', async () => {
		const onCopy = vi.fn();
		render(<CopyFormLinkButton onCopy={onCopy} disabled />);

		await userEvent.click(
			screen.getByRole('button', { name: 'Скопировать ссылку' }),
		);

		expect(onCopy).not.toHaveBeenCalled();
	});
});
