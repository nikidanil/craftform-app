import { Link } from 'react-router';
import { Inbox } from 'lucide-react';

import { routes } from '@/shared/lib';

import styles from './EmptyState.module.css';

export const EmptyState = () => (
	<div className={styles.root}>
		<Inbox className={styles.icon} aria-hidden />
		<p className={styles.message}>У вас пока нет форм. Создайте первую</p>
		<Link to={routes.formNew} className={styles.cta}>
			Создать форму
		</Link>
	</div>
);
