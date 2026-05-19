import { useParams } from 'react-router';

import { useForm } from '@/entities/form';
import { useResponse } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import { ResponseView } from '@/widgets/response-view';

import styles from './ResponseViewPage.module.css';

const isNotFound = (error: unknown): boolean =>
	error instanceof HttpError && error.status === 404;

export const ResponseViewPage = () => {
	const { formId = '', responseId = '' } = useParams<{
		formId: string;
		responseId: string;
	}>();
	const formQuery = useForm(formId);
	const responseQuery = useResponse(responseId);

	if (formQuery.isLoading || responseQuery.isLoading) {
		return <p className={styles.state}>Загружаем отклик…</p>;
	}

	if (isNotFound(formQuery.error) || isNotFound(responseQuery.error)) {
		return (
			<p role='alert' className={styles.state}>
				Отклик не найден
			</p>
		);
	}

	if (
		formQuery.error ||
		responseQuery.error ||
		!formQuery.data ||
		!responseQuery.data
	) {
		return (
			<p role='alert' className={styles.state}>
				Не удалось загрузить отклик. Попробуйте обновить страницу.
			</p>
		);
	}

	return <ResponseView form={formQuery.data} submission={responseQuery.data} />;
};
