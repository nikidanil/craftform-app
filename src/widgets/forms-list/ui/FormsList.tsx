import { useEffect } from 'react';

import type { Form } from '@/entities/form';
import { useDebouncedValue } from '@/shared/lib';

import {
	applyFormsListFilters,
	type SortOption,
	useFormsListInfiniteWindow,
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
	const { displayCount, hasMore, sentinelRef, reset } =
		useFormsListInfiniteWindow(filtered.length);

	useEffect(() => {
		reset();
	}, [debouncedSearch, sort, reset]);

	if (forms.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className={styles.root}>
			<FormsListToolbar
				search={search}
				onSearchChange={onSearchChange}
				sort={sort}
				onSortChange={onSortChange}
			/>
			<div aria-live='polite' className={styles.results}>
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
