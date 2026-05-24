import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

import type { Submission } from '@/entities/submission';
import { formatSubmittedAt, routes } from '@/shared/lib';

import styles from './ResponseListItem.module.css';

type Props = {
	submission: Submission;
};

export const ResponseListItem = ({ submission }: Props) => {
	const heading = `Отклик №${submission.number}`;

	return (
		<Link
			to={routes.responseView(submission.formId, submission.id)}
			className={styles.item}
		>
			<span className={styles.number} aria-hidden>
				{submission.number}
			</span>
			<div className={styles.body}>
				<h3 className={styles.title}>{heading}</h3>
			</div>
			<span className={styles.date}>
				{formatSubmittedAt(submission.createdAt)}
			</span>
			<ChevronRight className={styles.arrow} size={16} aria-hidden />
		</Link>
	);
};
