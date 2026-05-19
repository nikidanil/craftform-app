import { useParams } from 'react-router';
import { useForm as useFormQuery } from '@/entities/form';
import { FormBuilderForm } from '@/widgets/form-builder';
import styles from './FormBuilderPage.module.css';

export const FormBuilderPage = () => {
	const { formId = '' } = useParams<{ formId: string }>();
	const { data, isLoading, error } = useFormQuery(formId);

	if (isLoading) {
		return <p className={styles.state}>Загружаем форму…</p>;
	}

	if (error || !data) {
		return (
			<p role='alert' className={styles.state}>
				Не удалось загрузить форму
			</p>
		);
	}

	return <FormBuilderForm key={data.id} mode='edit' form={data} />;
};
