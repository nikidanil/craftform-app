import { useParams } from 'react-router';
import { useForm } from '@/entities/form';
import { HttpError } from '@/shared/api';
import { FormFillForm } from '@/widgets/form-fill';
import styles from './FormFillPage.module.css';

export const FormFillPage = () => {
	const { formId = '' } = useParams<{ formId: string }>();
	const { data, isLoading, error } = useForm(formId);

	if (isLoading) {
		return <p className={styles.state}>Загружаем форму…</p>;
	}

	if (error instanceof HttpError && error.status === 404) {
		return (
			<p role='alert' className={styles.state}>
				Форма не найдена
			</p>
		);
	}

	if (error || !data) {
		return (
			<p role='alert' className={styles.state}>
				Не удалось загрузить форму. Попробуйте обновить страницу.
			</p>
		);
	}

	return <FormFillForm form={data} />;
};
