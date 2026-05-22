import { useEffect } from 'react';
import { useParams } from 'react-router';

import { useForm } from '@/entities/form';
import { useResponsesList } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import { useSyncedSearchParam } from '@/shared/lib';
import {
	DEFAULT_SORT,
	isSortOption,
	ResponsesList,
	type SortOption,
} from '@/widgets/responses-list';

import styles from './ResponsesListPage.module.css';

export const ResponsesListPage = () => {
	const { formId = '' } = useParams<{ formId: string }>();
	const formQuery = useForm(formId);
	const responsesQuery = useResponsesList(formId);

	const [sortParam, setSortParam] = useSyncedSearchParam('sort', DEFAULT_SORT);
	const sort: SortOption = isSortOption(sortParam) ? sortParam : DEFAULT_SORT;
	const [dateFrom, setDateFrom] = useSyncedSearchParam('dateFrom', '');
	const [dateTo, setDateTo] = useSyncedSearchParam('dateTo', '');

	useEffect(() => {
		if (!isSortOption(sortParam)) {
			setSortParam(DEFAULT_SORT);
		}
	}, [sortParam, setSortParam]);

	if (formQuery.isLoading || responsesQuery.isLoading) {
		return <p className={styles.state}>Загружаем отклики…</p>;
	}

	if (
		formQuery.error instanceof HttpError &&
		formQuery.error.status === 404
	) {
		return (
			<p role='alert' className={styles.state}>
				Форма не найдена
			</p>
		);
	}

	if (formQuery.error || responsesQuery.error || !formQuery.data) {
		return (
			<p role='alert' className={styles.state}>
				Не удалось загрузить отклики. Попробуйте обновить страницу.
			</p>
		);
	}

	return (
		<ResponsesList
			formTitle={formQuery.data.title}
			responses={responsesQuery.data ?? []}
			sort={sort}
			onSortChange={setSortParam}
			dateFrom={dateFrom}
			onDateFromChange={setDateFrom}
			dateTo={dateTo}
			onDateToChange={setDateTo}
		/>
	);
};
