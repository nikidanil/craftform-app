import { Link, NavLink } from 'react-router';
import styles from './Header.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

const newFormClass = ({ isActive }: { isActive: boolean }) =>
	`${styles.link} ${styles.linkPrimary}${isActive ? ` ${styles.linkPrimaryActive}` : ''}`;

export const Header = () => (
	<header className={styles.header}>
		<Link to='/' className={styles.logo} aria-label='FormCraft — на главную'>
			<span className={styles.logoIcon} aria-hidden>
				+
			</span>
			<span className={styles.logoName}>FormCraft</span>
		</Link>
		<nav className={styles.nav}>
			<NavLink to='/' end className={linkClass}>
				Главная
			</NavLink>
			<NavLink to='/forms/new' className={newFormClass}>
				Новая форма
			</NavLink>
			<NavLink to='/me' className={linkClass}>
				Профиль
			</NavLink>
		</nav>
		<button type='button' className={styles.logout}>
			Выход
		</button>
	</header>
);
