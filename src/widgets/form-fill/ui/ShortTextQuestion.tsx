import { useFormContext } from 'react-hook-form';
import type { Question } from '@/entities/form';
import type { FormFillValues } from '../model';
import styles from './FormFillForm.module.css';

type Props = { question: Question };

export const ShortTextQuestion = ({ question }: Props) => {
	const { register } = useFormContext<FormFillValues>();

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
				{...register(question.id)}
			/>
		</div>
	);
};
