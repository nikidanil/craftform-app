import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResponsesListToolbar } from '../ui/ResponsesListToolbar';
import type { SortOption } from '../model';

type HarnessProps = {
	initialSort?: SortOption;
	initialDateFrom?: string;
	initialDateTo?: string;
	onSortChange?: (next: SortOption) => void;
	onDateFromChange?: (next: string) => void;
	onDateToChange?: (next: string) => void;
};

const Harness = ({
	initialSort = 'date-desc',
	initialDateFrom = '',
	initialDateTo = '',
	onSortChange,
	onDateFromChange,
	onDateToChange,
}: HarnessProps) => {
	const [sort, setSort] = useState<SortOption>(initialSort);
	const [dateFrom, setDateFrom] = useState(initialDateFrom);
	const [dateTo, setDateTo] = useState(initialDateTo);

	return (
		<ResponsesListToolbar
			sort={sort}
			onSortChange={(next) => {
				setSort(next);
				onSortChange?.(next);
			}}
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

describe('ResponsesListToolbar', () => {
	it('передаёт выбранный SortOption после клика по опции в селекте', async () => {
		const onSortChange = vi.fn<(next: SortOption) => void>();
		render(<Harness onSortChange={onSortChange} />);

		await userEvent.click(
			screen.getByRole('combobox', { name: /сортировка/i }),
		);
		const option = await screen.findByRole('option', {
			name: 'Сначала старые',
		});
		await userEvent.click(option);

		expect(onSortChange).toHaveBeenLastCalledWith('date-asc');
	});

	it('очистка поля «От» в фильтре дат пробрасывается родителю', async () => {
		const onDateFromChange = vi.fn<(next: string) => void>();
		render(
			<Harness
				initialDateFrom='2026-02-10'
				onDateFromChange={onDateFromChange}
			/>,
		);

		await userEvent.click(screen.getByRole('button', { name: /дата от/i }));
		await userEvent.click(
			await screen.findByRole('button', { name: /очистить/i }),
		);

		expect(onDateFromChange).toHaveBeenLastCalledWith('');
	});
});
