import { Fragment, useEffect } from 'react';
import {
	FormProvider,
	useForm,
	type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';

import type { Form } from '@/entities/form';
import { useSubmitResponseAction } from '@/features/submit-response';
import {
	buildDefaults,
	buildFormFillSchema,
	toSubmissionInput,
	type FormFillValues,
} from '../model';
import { FormFillQuestion } from './FormFillQuestion';
import { SuccessCard } from './SuccessCard';
import styles from './FormFillForm.module.css';

type Props = { form: Form };

export const FormFillForm = ({ form }: Props) => {
	const { submit, status, errorMessage } = useSubmitResponseAction();

	const methods = useForm<FormFillValues>({
		resolver: zodResolver(buildFormFillSchema(form)) as unknown as Resolver<FormFillValues>,
		defaultValues: buildDefaults(form),
		mode: 'onChange',
	});

	const { trigger, formState: { isValid, isSubmitting }, handleSubmit } = methods;

	useEffect(() => {
		void trigger();
	}, [trigger]);

	const onSubmit: SubmitHandler<FormFillValues> = (values) => {
		submit(toSubmissionInput(values, form));
	};

	if (status === 'success') {
		return (
			<div className={styles.formContainer}>
				<SuccessCard />
			</div>
		);
	}

	return (
		<FormProvider {...methods}>
			<div className={styles.formContainer}>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<div className={styles.headerCard}>
						<h1 className={styles.formTitle}>{form.title}</h1>
						{form.description && (
							<p className={styles.formDescription}>{form.description}</p>
						)}
					</div>

					<div className={styles.formBody}>
						{form.questions.map((question, index) => (
							<Fragment key={question.id}>
								{index > 0 && <hr className={styles.divider} />}
								<FormFillQuestion question={question} />
							</Fragment>
						))}
					</div>

					<div className={styles.formFooter}>
						<span className={styles.requiredNote}>* — обязательные поля</span>
						<div className={styles.footerRight}>
							{status === 'error' && errorMessage && (
								<p role="alert" className={styles.errorAlert}>
									{errorMessage}
								</p>
							)}
							<button
								type="submit"
								className={styles.btnSubmit}
								disabled={!isValid || isSubmitting || status === 'pending'}
							>
								Отправить
							</button>
						</div>
					</div>
				</form>
			</div>
		</FormProvider>
	);
};
