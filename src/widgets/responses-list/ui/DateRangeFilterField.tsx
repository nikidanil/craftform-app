import { useState } from 'react';
import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, XIcon } from 'lucide-react';

import {
	Button,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/ui';

import styles from './DateRangeFilter.module.css';

type Props = {
	value: string;
	onChange: (next: string) => void;
	placeholder: string;
	ariaLabel: string;
};

const ISO_DATE = 'yyyy-MM-dd';
const DISPLAY = 'dd.MM.yyyy';

export const DateRangeFilterField = ({
	value,
	onChange,
	placeholder,
	ariaLabel,
}: Props) => {
	const [open, setOpen] = useState(false);
	const selected =
		value === '' ? undefined : parse(value, ISO_DATE, new Date());
	const triggerLabel = selected
		? format(selected, DISPLAY, { locale: ru })
		: placeholder;

	const handleSelect = (date: Date | undefined) => {
		if (!date) {
			return;
		}
		onChange(format(date, ISO_DATE));
		setOpen(false);
	};

	const handleClear = () => {
		onChange('');
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						type='button'
						variant='outline'
						aria-label={ariaLabel}
						className={styles.trigger}
					>
						<CalendarIcon className={styles.icon} />
						{triggerLabel}
					</Button>
				}
			/>
			<PopoverContent align='start' className={styles.popup}>
				<Calendar
					mode='single'
					selected={selected}
					onSelect={handleSelect}
					defaultMonth={selected}
					locale={ru}
				/>
				{value !== '' && (
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className={styles.clear}
						onClick={handleClear}
					>
						<XIcon className={styles.icon} />
						Очистить
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
};
