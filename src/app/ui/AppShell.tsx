import { Outlet } from 'react-router';
import { Header } from '@/widgets/header';
import { cn } from '@/shared/lib';
import styles from './AppShell.module.css';

type Props = {
	fullBleed?: boolean;
};

export const AppShell = ({ fullBleed = false }: Props) => (
	<div className={cn(styles.shell, fullBleed && styles.shellFixed)}>
		<Header />
		<main className={cn(styles.content, fullBleed && styles.contentFull)}>
			<Outlet />
		</main>
	</div>
);
