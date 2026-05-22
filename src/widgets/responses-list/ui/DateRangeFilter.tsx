import { DateRangeFilterField } from './DateRangeFilterField';
import styles from './DateRangeFilter.module.css';

type Props = {
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (next: string) => void;
	onDateToChange: (next: string) => void;
};

export const DateRangeFilter = ({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
}: Props) => (
	<div className={styles.root}>
		<DateRangeFilterField
			value={dateFrom}
			onChange={onDateFromChange}
			placeholder='От'
			ariaLabel='Дата от'
		/>
		<DateRangeFilterField
			value={dateTo}
			onChange={onDateToChange}
			placeholder='До'
			ariaLabel='Дата до'
		/>
	</div>
);
