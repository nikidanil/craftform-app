import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';

import { useFormsList } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { useCurrentUser } from '@/entities/session';
import { useSyncedSearchParam } from '@/shared/lib';
import { Alert, AlertDescription } from '@/shared/ui';
import {
	DEFAULT_SORT,
	FormsList,
	isSortOption,
	type SortOption,
} from '@/widgets/forms-list';

import styles from './FormsListPage.module.css';

export const FormsListPage = () => {
	const formsQuery = useFormsList();
	const countsQuery = useResponsesCountByForm();
	const currentUser = useCurrentUser();
	const location = useLocation();
	const flashMessage = (location.state as { message?: string } | null)
		?.message;

	const [search, setSearch] = useSyncedSearchParam('q', '');
	const [sortParam, setSortParam] = useSyncedSearchParam('sort', DEFAULT_SORT);
	const sort: SortOption = isSortOption(sortParam) ? sortParam : DEFAULT_SORT;

	useEffect(() => {
		if (!isSortOption(sortParam)) {
			setSortParam(DEFAULT_SORT);
		}
	}, [sortParam, setSortParam]);

	const myForms = useMemo(() => {
		const allForms = formsQuery.data ?? [];
		if (!currentUser) return [];
		return allForms.filter((form) => form.authorId === currentUser.id);
	}, [formsQuery.data, currentUser]);

	const isLoading = formsQuery.isLoading || countsQuery.isLoading;
	const isError = formsQuery.isError || countsQuery.isError;

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>Мои формы</h1>
			</header>

			{flashMessage ? (
				<Alert className={styles.flash}>
					<AlertDescription>{flashMessage}</AlertDescription>
				</Alert>
			) : null}

			{isLoading && <p className={styles.state}>Загружаем формы…</p>}

			{isError && (
				<p className={styles.error} role='alert'>
					Не удалось загрузить список форм. Попробуйте обновить страницу.
				</p>
			)}

			{!isLoading && !isError && (
				<FormsList
					forms={myForms}
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
