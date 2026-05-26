import { NavLink } from 'react-router';
import { LogoutButton } from '@/features/logout';
import { Logo } from '@/shared/ui';
import { routes } from '@/shared/lib';
import styles from './Header.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

const newFormClass = ({ isActive }: { isActive: boolean }) =>
	`${styles.link} ${styles.linkPrimary}${isActive ? ` ${styles.linkPrimaryActive}` : ''}`;

export const Header = () => (
	<header className={styles.header}>
		<Logo />
		<nav className={styles.nav}>
			<NavLink to={routes.home} end className={linkClass}>
				Главная
			</NavLink>
			<NavLink to={routes.formNew} className={newFormClass}>
				Новая форма
			</NavLink>
			<NavLink to={routes.profile} className={linkClass}>
				Профиль
			</NavLink>
		</nav>
		<LogoutButton className={styles.logout} />
	</header>
);
