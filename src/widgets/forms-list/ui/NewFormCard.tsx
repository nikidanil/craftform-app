import { Link } from 'react-router';
import { Plus } from 'lucide-react';

import styles from './NewFormCard.module.css';

export const NewFormCard = () => (
	<Link to='/forms/new' className={styles.card}>
		<span className={styles.iconWrap} aria-hidden>
			<Plus className={styles.icon} />
		</span>
		<span className={styles.text}>Создать новую форму</span>
	</Link>
);
