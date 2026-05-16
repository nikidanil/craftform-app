import { useFormsList } from '@/entities/form';
import { useResponsesCountByForm } from '@/entities/submission';
import { FormsList } from '@/widgets/forms-list';

import styles from './FormsListPage.module.css';

export const FormsListPage = () => {
	const formsQuery = useFormsList();
	const countsQuery = useResponsesCountByForm();

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
				/>
			)}
		</main>
	);
};
