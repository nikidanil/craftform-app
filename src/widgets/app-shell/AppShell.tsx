import { Outlet } from 'react-router';
import { Header } from '@/widgets/header';
import styles from './AppShell.module.css';

export const AppShell = () => (
	<div className={styles.shell}>
		<Header />
		<main className={styles.content}>
			<Outlet />
		</main>
	</div>
);
