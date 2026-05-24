import { Link, NavLink } from 'react-router';
import { LogoutButton } from '@/features/logout';
import { routes } from '@/shared/lib';
import styles from './Header.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

const newFormClass = ({ isActive }: { isActive: boolean }) =>
	`${styles.link} ${styles.linkPrimary}${isActive ? ` ${styles.linkPrimaryActive}` : ''}`;

export const Header = () => (
	<header className={styles.header}>
		<Link
			to={routes.home}
			className={styles.logo}
			aria-label='FormCraft — на главную'
		>
			<span className={styles.logoIcon} aria-hidden>
				+
			</span>
			<span className={styles.logoName}>FormCraft</span>
		</Link>
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
