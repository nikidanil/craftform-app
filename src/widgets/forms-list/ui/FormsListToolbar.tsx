import { Search } from 'lucide-react';

import {
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui';

import { isSortOption, SORT_OPTIONS, type SortOption } from '../model';

import styles from './FormsListToolbar.module.css';

type Props = {
	search: string;
	onSearchChange: (next: string) => void;
	sort: SortOption;
	onSortChange: (next: SortOption) => void;
};

export const FormsListToolbar = ({
	search,
	onSearchChange,
	sort,
	onSortChange,
}: Props) => (
	<div className={styles.toolbar}>
		<div className={styles.searchWrap}>
			<Search className={styles.searchIcon} aria-hidden />
			<Input
				type='search'
				value={search}
				onChange={(event) => onSearchChange(event.target.value)}
				placeholder='Поиск по названию…'
				aria-label='Поиск форм по названию'
				className={styles.searchInput}
			/>
		</div>
		<Select
			value={sort}
			onValueChange={(value) => {
				if (typeof value === 'string' && isSortOption(value)) {
					onSortChange(value);
				}
			}}
		>
			<SelectTrigger
				aria-label='Сортировка списка форм'
				className={styles.sortTrigger}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{SORT_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
);
