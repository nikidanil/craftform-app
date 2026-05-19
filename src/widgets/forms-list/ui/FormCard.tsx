import { Link } from 'react-router';
import { MessageSquare, Pencil } from 'lucide-react';

import type { Form } from '@/entities/form';
import { DeleteFormButton } from '@/features/delete-form';
import { responsesCountLabel } from '@/shared/lib';

import { formatCreatedAt } from '../model/formatCreatedAt';
import styles from './FormCard.module.css';

type Props = {
	form: Form;
	responsesCount: number;
};

export const FormCard = ({ form, responsesCount }: Props) => {
	const formIdSegment = encodeURIComponent(form.id);

	return (
		<article className={styles.card}>
			<div className={styles.body}>
				<h2 className={styles.title}>{form.title}</h2>
				<span className={styles.badge}>
					<span className={styles.badgeDot} aria-hidden />
					{responsesCountLabel(responsesCount)}
				</span>
				<p className={styles.date}>{formatCreatedAt(form.createdAt)}</p>
			</div>
			<div className={styles.actions}>
				<Link
					to={`/forms/${formIdSegment}/edit`}
					className={styles.actionPrimary}
				>
					<Pencil aria-hidden />
					Редактировать
				</Link>
				<Link
					to={`/forms/${formIdSegment}/responses`}
					className={styles.action}
				>
					<MessageSquare aria-hidden />
					Отклики
				</Link>
				<div className={styles.deleteSlot}>
					<DeleteFormButton formId={form.id} iconOnly />
				</div>
			</div>
		</article>
	);
};
