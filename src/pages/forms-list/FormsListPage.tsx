import { useEffect } from 'react';

import { useFormsByAuthor } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { useCurrentUser } from '@/entities/session';
import { useSyncedSearchParam } from '@/shared/lib';
import {
	DEFAULT_SORT,
	FormsList,
	isSortOption,
	type SortOption,
} from '@/widgets/forms-list';

import styles from './FormsListPage.module.css';

export const FormsListPage = () => {
	const currentUser = useCurrentUser();
	const formsQuery = useFormsByAuthor(currentUser?.id);
	const countsQuery = useResponsesCountByForm();

	const [search, setSearch] = useSyncedSearchParam('q', '');
	const [sortParam, setSortParam] = useSyncedSearchParam('sort', DEFAULT_SORT);
	const sort: SortOption = isSortOption(sortParam) ? sortParam : DEFAULT_SORT;

	useEffect(() => {
		if (!isSortOption(sortParam)) {
			setSortParam(DEFAULT_SORT);
		}
	}, [sortParam, setSortParam]);

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
					forms={formsQuery.data}
					responsesCountByForm={countsQuery.data ?? {}}
					search={search}
					onSearchChange={setSearch}
					sort={sort}
					onSortChange={setSortParam}
				/>
			)}
		</main>
	);
};
