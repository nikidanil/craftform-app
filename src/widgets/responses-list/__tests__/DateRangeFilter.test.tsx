import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateRangeFilter } from '../ui/DateRangeFilter';

type HarnessProps = {
	initialDateFrom?: string;
	initialDateTo?: string;
	onDateFromChange?: (next: string) => void;
	onDateToChange?: (next: string) => void;
};

const Harness = ({
	initialDateFrom = '',
	initialDateTo = '',
	onDateFromChange,
	onDateToChange,
}: HarnessProps) => {
	const [dateFrom, setDateFrom] = useState(initialDateFrom);
	const [dateTo, setDateTo] = useState(initialDateTo);

	return (
		<DateRangeFilter
			dateFrom={dateFrom}
			dateTo={dateTo}
			onDateFromChange={(next) => {
				setDateFrom(next);
				onDateFromChange?.(next);
			}}
			onDateToChange={(next) => {
				setDateTo(next);
				onDateToChange?.(next);
			}}
		/>
	);
};

describe('DateRangeFilter', () => {
	it('пользователь открывает попап на пустом поле — видит календарь и плейсхолдер без кнопки «Очистить»', async () => {
		render(<Harness />);

		const triggerFrom = screen.getByRole('button', { name: /дата от/i });
		expect(triggerFrom).toHaveTextContent('От');

		await userEvent.click(triggerFrom);

		expect(await screen.findByRole('grid')).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: /очистить/i }),
		).not.toBeInTheDocument();
	});

	it('пользователь очищает поле «От» — значение сбрасывается, поле «До» не задето, фокус возвращается на триггер', async () => {
		const onDateFromChange = vi.fn<(next: string) => void>();
		const onDateToChange = vi.fn<(next: string) => void>();
		render(
			<Harness
				initialDateFrom='2026-02-10'
				initialDateTo='2026-03-15'
				onDateFromChange={onDateFromChange}
				onDateToChange={onDateToChange}
			/>,
		);

		const triggerFrom = screen.getByRole('button', { name: /дата от/i });
		const triggerTo = screen.getByRole('button', { name: /дата до/i });
		expect(triggerFrom).toHaveTextContent('10.02.2026');
		expect(triggerTo).toHaveTextContent('15.03.2026');

		await userEvent.click(triggerFrom);
		await userEvent.click(
			await screen.findByRole('button', { name: /очистить/i }),
		);

		expect(onDateFromChange).toHaveBeenLastCalledWith('');
		expect(onDateToChange).not.toHaveBeenCalled();
		expect(triggerFrom).toHaveTextContent('От');
		expect(triggerTo).toHaveTextContent('15.03.2026');
		expect(triggerFrom).toHaveFocus();
	});
});
