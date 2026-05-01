import { NavLink } from 'react-router';
import styles from './Header.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

export const Header = () => (
	<header className={styles.header}>
		<nav className={styles.nav}>
			<NavLink to='/' end className={linkClass}>
				Главная
			</NavLink>
			<NavLink to='/forms/new' className={linkClass}>
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
