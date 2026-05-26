import { Link } from 'react-router';
import { routes } from '@/shared/lib';
import styles from './Logo.module.css';

export const Logo = () => (
	<Link
		to={routes.home}
		className={styles.logo}
		aria-label='FormCraft — на главную'
	>
		<span className={styles.icon} aria-hidden='true'>
			✦
		</span>
		<span className={styles.name}>FormCraft</span>
	</Link>
);
