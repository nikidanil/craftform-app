import { Link } from 'react-router';
import { MessageSquare } from 'lucide-react';

import type { Submission } from '@/entities/submission';
import { responsesCountLabel } from '@/shared/lib';

import { EmptyState } from './EmptyState';
import { ResponseListItem } from './ResponseListItem';
import styles from './ResponsesList.module.css';

type Props = {
	formTitle: string;
	responses: Submission[];
};

export const ResponsesList = ({ formTitle, responses }: Props) => (
	<section className={styles.page}>
		<nav className={styles.breadcrumb} aria-label='Хлебные крошки'>
			<Link to='/'>Главная</Link>
			<span className={styles.breadcrumbSep} aria-hidden>
				›
			</span>
			<span aria-current='page'>Отклики</span>
		</nav>

		<header className={styles.heading}>
			<div className={styles.headingLeft}>
				<p className={styles.formCaption}>
					Форма: <span>{formTitle}</span>
				</p>
				<h1 className={styles.title}>Отклики</h1>
			</div>
			<span className={styles.badge}>
				<MessageSquare size={13} strokeWidth={2.5} aria-hidden />
				{responsesCountLabel(responses.length)}
			</span>
		</header>

		{responses.length === 0 ? (
			<EmptyState />
		) : (
			<ul className={styles.list} aria-label='Список откликов'>
				{responses.map((submission) => (
					<li key={submission.id}>
						<ResponseListItem submission={submission} />
					</li>
				))}
			</ul>
		)}
	</section>
);
