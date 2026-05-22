import { Inbox } from 'lucide-react';

import styles from './EmptyState.module.css';

export const EmptyState = () => (
	<div className={styles.empty}>
		<Inbox className={styles.icon} aria-hidden />
		<p className={styles.text}>Для данной формы нет откликов</p>
	</div>
);
