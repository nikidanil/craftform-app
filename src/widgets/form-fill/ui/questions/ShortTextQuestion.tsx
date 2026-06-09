import { useFormContext } from 'react-hook-form';
import type { Question } from '@/entities/form';
import { useQuestionFieldError, type FormFillValues } from '../../model';
import styles from '../FormFillForm.module.css';

type Props = { question: Question };

export const ShortTextQuestion = ({ question }: Props) => {
	const { register } = useFormContext<FormFillValues>();
	const { showError, message, errorId } = useQuestionFieldError(question.id);

	return (
		<div className={styles.questionBlock}>
			<label htmlFor={question.id} className={styles.questionLabel}>
				{question.body}
				{question.required && (
					<span className={styles.requiredStar} aria-hidden="true">
						*
					</span>
				)}
			</label>
			<input
				id={question.id}
				type="text"
				className={styles.fieldInput}
				placeholder="Ваш ответ..."
				aria-required={question.required}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? errorId : undefined}
				{...register(question.id)}
			/>
			{showError && (
				<p id={errorId} role="alert" className={styles.fieldError}>
					{message}
				</p>
			)}
		</div>
	);
};
