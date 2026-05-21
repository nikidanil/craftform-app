import { useState } from 'react';

import { useFormsList } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { DEFAULT_SORT, FormsList, type SortOption } from '@/widgets/forms-list';

import styles from './FormsListPage.module.css';

export const FormsListPage = () => {
	const formsQuery = useFormsList();
	const countsQuery = useResponsesCountByForm();

	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

	const isLoading = formsQuery.isLoading || countsQuery.isLoading;
	const isError = formsQuery.isError || countsQuery.isError;

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>Мои формы</h1>
			</header>

			{isLoading && <p className={styles.state}>Загружаем формы…</p>}

			{isError && (
				<p className={styles.error} role='alert'>
					Не удалось загрузить список форм. Попробуйте обновить страницу.
				</p>
			)}

			{!isLoading && !isError && (
				<FormsList
					forms={formsQuery.data ?? []}
					responsesCountByForm={countsQuery.data ?? {}}
					search={search}
					onSearchChange={setSearch}
					sort={sort}
					onSortChange={setSort}
				/>
			)}
		</main>
	);
};
