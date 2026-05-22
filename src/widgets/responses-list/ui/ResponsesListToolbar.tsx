import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui';

import { isSortOption, SORT_OPTIONS, type SortOption } from '../model';

import { DateRangeFilter } from './DateRangeFilter';
import styles from './ResponsesListToolbar.module.css';

type Props = {
	sort: SortOption;
	onSortChange: (next: SortOption) => void;
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (next: string) => void;
	onDateToChange: (next: string) => void;
};

export const ResponsesListToolbar = ({
	sort,
	onSortChange,
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
}: Props) => (
	<div className={styles.toolbar}>
		<Select
			value={sort}
			onValueChange={(value) => {
				if (typeof value === 'string' && isSortOption(value)) {
					onSortChange(value);
				}
			}}
		>
			<SelectTrigger
				aria-label='Сортировка списка откликов'
				className={styles.sortTrigger}
			>
				<SelectValue>
					{(value) =>
						SORT_OPTIONS.find((option) => option.value === value)?.label ?? ''
					}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{SORT_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
		<DateRangeFilter
			dateFrom={dateFrom}
			dateTo={dateTo}
			onDateFromChange={onDateFromChange}
			onDateToChange={onDateToChange}
		/>
	</div>
);
