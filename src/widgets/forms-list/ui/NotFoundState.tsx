import { SearchX } from 'lucide-react';

import styles from './NotFoundState.module.css';

export const NotFoundState = () => (
	<div className={styles.root}>
		<SearchX className={styles.icon} aria-hidden />
		<p className={styles.message}>Формы с данным названием не найдены</p>
	</div>
);
