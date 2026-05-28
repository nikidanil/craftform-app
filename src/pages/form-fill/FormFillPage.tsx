import type React from 'react';
import { useParams } from 'react-router';
import { useForm } from '@/entities/form';
import { HttpError } from '@/shared/api';
import { FormFillForm } from '@/widgets/form-fill';
import styles from './FormFillPage.module.css';

export const FormFillPage = () => {
	const { formId = '' } = useParams<{ formId: string }>();
	const { data, isLoading, error } = useForm(formId);

	let content: React.ReactNode;

	if (isLoading) {
		content = <p className={styles.state}>Загружаем форму…</p>;
	} else if (error instanceof HttpError && error.status === 404) {
		content = (
			<p role='alert' className={styles.state}>
				Форма не найдена
			</p>
		);
	} else if (error || !data) {
		content = (
			<p role='alert' className={styles.state}>
				Не удалось загрузить форму. Попробуйте обновить страницу.
			</p>
		);
	} else {
		content = <FormFillForm form={data} />;
	}

	return <div className={styles.page}>{content}</div>;
};
