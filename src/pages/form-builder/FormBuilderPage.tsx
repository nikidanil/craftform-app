import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm as useFormQuery } from '@/entities/form';
import { useCurrentUser } from '@/entities/session';
import { routes } from '@/shared/lib';
import { FormBuilderForm } from '@/widgets/form-builder';
import styles from './FormBuilderPage.module.css';

export const FormBuilderPage = () => {
	const { formId = '' } = useParams<{ formId: string }>();
	const { data, isLoading, error } = useFormQuery(formId);
	const currentUser = useCurrentUser();
	const navigate = useNavigate();

	const isForeignForm = Boolean(
		data && currentUser && data.authorId !== currentUser.id,
	);

	useEffect(() => {
		if (isForeignForm) {
			navigate(routes.home, { replace: true });
		}
	}, [isForeignForm, navigate]);

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

	if (isForeignForm) {
		return null;
	}

	return <FormBuilderForm key={data.id} mode='edit' form={data} />;
};
