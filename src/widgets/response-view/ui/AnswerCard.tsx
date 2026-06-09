import type { ReactNode } from 'react';

import {
	isChoiceQuestion,
	isLongTextQuestion,
	type Question,
} from '@/entities/form';
import type { Answer } from '@/entities/submission';

import { getSelectedOptionLabels } from '../model';
import styles from './AnswerCard.module.css';

type Props = {
	question: Question;
	answer: Answer | undefined;
	index: number;
};

const getBadgeLabel = (question: Question): string => {
	if (isLongTextQuestion(question)) {
		return 'Длинный текст';
	}
	if (isChoiceQuestion(question)) {
		return question.choiceVariant === 'multiple' ? 'Флажки' : 'Переключатели';
	}
	return 'Короткий текст';
};

const renderValue = (
	question: Question,
	answer: Answer | undefined,
): ReactNode => {
	if (isChoiceQuestion(question)) {
		const labels = getSelectedOptionLabels(question, answer?.value);
		if (labels.length === 0) {
			return <span className={styles.empty}>—</span>;
		}
		const markerShape =
			question.choiceVariant === 'multiple' ? 'square' : 'circle';
		return (
			<ul className={styles.choices}>
				{labels.map((label) => (
					<li key={label}>
						<span
							className={styles.marker}
							data-shape={markerShape}
							aria-hidden
						/>
						{label}
					</li>
				))}
			</ul>
		);
	}

	const text = typeof answer?.value === 'string' ? answer.value : '';
	if (text.trim() === '') {
		return <span className={styles.empty}>—</span>;
	}
	return <p className={styles.text}>{text}</p>;
};

export const AnswerCard = ({ question, answer, index }: Props) => (
	<article className={styles.card}>
		<header className={styles.question}>
			<span className={styles.number} aria-hidden>
				{index + 1}
			</span>
			<span className={styles.body}>{question.body}</span>
			<span className={styles.badge}>{getBadgeLabel(question)}</span>
		</header>
		<div className={styles.value}>{renderValue(question, answer)}</div>
	</article>
);
