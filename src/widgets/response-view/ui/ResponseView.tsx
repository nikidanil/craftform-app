import { Link } from 'react-router';
import { Calendar, ExternalLink, Pencil } from 'lucide-react';

import type { Form } from '@/entities/form';
import type { Submission } from '@/entities/submission';
import { formatSubmittedAt, routes } from '@/shared/lib';

import { findAnswerForQuestion } from '../model/findAnswerForQuestion';
import { AnswerCard } from './AnswerCard';
import styles from './ResponseView.module.css';

type Props = {
	form: Form;
	submission: Submission;
};

export const ResponseView = ({ form, submission }: Props) => {
	const heading = `Отклик №${submission.number}`;

	return (
		<section className={styles.page}>
			<nav className={styles.breadcrumb} aria-label='Хлебные крошки'>
				<Link to={routes.home}>Главная</Link>
				<span className={styles.breadcrumbSep} aria-hidden>
					›
				</span>
				<Link to={routes.formResponses(form.id)}>Отклики</Link>
				<span className={styles.breadcrumbSep} aria-hidden>
					›
				</span>
				<span aria-current='page'>{heading}</span>
			</nav>

			<header className={styles.header}>
				<div className={styles.headerLeft}>
					<h1 className={styles.title}>{heading}</h1>
					<div className={styles.meta}>
						<span className={styles.metaDate}>
							<Calendar size={11} strokeWidth={2.5} aria-hidden />
							{formatSubmittedAt(submission.createdAt)}
						</span>
						<span className={styles.metaForm}>
							Форма: <span>{form.title}</span>
						</span>
					</div>
				</div>
				<div className={styles.actions}>
					<Link to={routes.formFill(form.id)} className={styles.action}>
						<ExternalLink size={13} strokeWidth={2.5} aria-hidden />
						Перейти к форме
					</Link>
					<Link
						to={routes.formEdit(form.id)}
						className={styles.actionPrimary}
					>
						<Pencil size={13} strokeWidth={2.5} aria-hidden />
						Редактировать форму
					</Link>
				</div>
			</header>

			<ul className={styles.answers} aria-label='Ответы по вопросам формы'>
				{form.questions.map((question, questionIndex) => (
					<li key={question.id}>
						<AnswerCard
							question={question}
							answer={findAnswerForQuestion(
								submission.answers,
								question.id,
							)}
							index={questionIndex}
						/>
					</li>
				))}
			</ul>
		</section>
	);
};
