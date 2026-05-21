import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormsListToolbar } from '../FormsListToolbar';
import type { SortOption } from '../../model';

type HarnessProps = {
	onSearchChange?: (next: string) => void;
	onSortChange?: (next: SortOption) => void;
};

const Harness = ({ onSearchChange, onSortChange }: HarnessProps) => {
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortOption>('created-desc');

	return (
		<FormsListToolbar
			search={search}
			onSearchChange={(next) => {
				setSearch(next);
				onSearchChange?.(next);
			}}
			sort={sort}
			onSortChange={(next) => {
				setSort(next);
				onSortChange?.(next);
			}}
		/>
	);
};

describe('FormsListToolbar', () => {
	it('передаёт введённое значение поиска родителю', async () => {
		const onSearchChange = vi.fn<(next: string) => void>();
		render(<Harness onSearchChange={onSearchChange} />);

		await userEvent.type(
			screen.getByRole('searchbox', { name: /поиск форм/i }),
			'опрос',
		);

		expect(onSearchChange).toHaveBeenLastCalledWith('опрос');
	});

	it('передаёт выбранный SortOption после клика по опции в селекте', async () => {
		const onSortChange = vi.fn<(next: SortOption) => void>();
		render(<Harness onSortChange={onSortChange} />);

		await userEvent.click(
			screen.getByRole('combobox', { name: /сортировка/i }),
		);
		const option = await screen.findByRole('option', {
			name: 'По названию: А–Я',
		});
		await userEvent.click(option);

		expect(onSortChange).toHaveBeenLastCalledWith('title-asc');
	});
});
