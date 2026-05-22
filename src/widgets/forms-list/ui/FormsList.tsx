import { useEffect } from 'react';

import type { Form } from '@/entities/form';
import { useDebouncedValue, useInfiniteWindow } from '@/shared/lib';

import {
	applyFormsListFilters,
	DEFAULT_SORT,
	type SortOption,
} from '../model';

import { EmptyState } from './EmptyState';
import { FormCard } from './FormCard';
import { FormsListToolbar } from './FormsListToolbar';
import { NewFormCard } from './NewFormCard';
import { NotFoundState } from './NotFoundState';
import styles from './FormsList.module.css';

type Props = {
	forms: Form[];
	responsesCountByForm: Record<string, number>;
	search: string;
	onSearchChange: (next: string) => void;
	sort: SortOption;
	onSortChange: (next: SortOption) => void;
	searchDebounceMs?: number;
};

export const FormsList = ({
	forms,
	responsesCountByForm,
	search,
	onSearchChange,
	sort,
	onSortChange,
	searchDebounceMs = 250,
}: Props) => {
	const debouncedSearch = useDebouncedValue(search, searchDebounceMs);
	const filtered = applyFormsListFilters(forms, responsesCountByForm, {
		search: debouncedSearch,
		sort,
	});
	const { displayCount, hasMore, sentinelRef, reset } = useInfiniteWindow(
		filtered.length,
	);

	useEffect(() => {
		reset();
	}, [debouncedSearch, sort, reset]);

	if (forms.length === 0) {
		return <EmptyState />;
	}

	const isDefaultView = debouncedSearch === '' && sort === DEFAULT_SORT;
	const announcement = isDefaultView
		? ''
		: filtered.length === 0
			? 'Формы не найдены'
			: `Найдено форм: ${filtered.length}`;

	return (
		<div className={styles.root}>
			<FormsListToolbar
				search={search}
				onSearchChange={onSearchChange}
				sort={sort}
				onSortChange={onSortChange}
			/>
			<span
				aria-live='polite'
				aria-atomic='true'
				className={styles.srOnly}
			>
				{announcement}
			</span>
			<div className={styles.results}>
				{filtered.length === 0 ? (
					<NotFoundState />
				) : (
					<div className={styles.grid}>
						{filtered.slice(0, displayCount).map((form) => (
							<FormCard
								key={form.id}
								form={form}
								responsesCount={responsesCountByForm[form.id] ?? 0}
							/>
						))}
						<NewFormCard />
						{hasMore && (
							<>
								<p className={styles.loading}>Загружаем ещё…</p>
								<div
									ref={sentinelRef}
									className={styles.sentinel}
									aria-hidden
								/>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
