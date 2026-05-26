import { useFormContext } from 'react-hook-form';
import type { Question } from '@/entities/form';
import { useQuestionFieldError, type FormFillValues } from '../model';
import styles from './FormFillForm.module.css';

type Props = { question: Question };

export const ChoiceQuestion = ({ question }: Props) => {
	const { register } = useFormContext<FormFillValues>();
	const { showError, message, errorId } = useQuestionFieldError(question.id);
	const isMultiple = question.choiceVariant === 'multiple';

	return (
		<div className={styles.questionBlock}>
			<div id={`label-${question.id}`} className={styles.questionLabel}>
				{question.body}
				{question.required && (
					<span className={styles.requiredStar} aria-hidden="true">
						*
					</span>
				)}
			</div>
			<div
				className={styles.optionsList}
				role={isMultiple ? 'group' : 'radiogroup'}
				aria-labelledby={`label-${question.id}`}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? errorId : undefined}
			>
				{question.options?.map((option) => (
					<label key={option.id} className={styles.optionItem}>
						{isMultiple ? (
							<>
								<input
									type="checkbox"
									value={option.id}
									className={styles.srOnly}
									{...register(question.id)}
								/>
								<div className={styles.optionCheck}>
									<svg
										width="10"
										height="10"
										viewBox="0 0 24 24"
										fill="none"
										stroke="white"
										strokeWidth="3.5"
										aria-hidden="true"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
							</>
						) : (
							<>
								<input
									type="radio"
									value={option.id}
									className={styles.srOnly}
									{...register(question.id)}
								/>
								<div className={styles.optionRadio}>
									<div className={styles.optionRadioDot} />
								</div>
							</>
						)}
						<span className={styles.optionText}>{option.label}</span>
					</label>
				))}
			</div>
			{showError && (
				<p id={errorId} role="alert" className={styles.fieldError}>
					{message}
				</p>
			)}
		</div>
	);
};
