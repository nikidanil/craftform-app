import { NavLink, useNavigate } from 'react-router';
import { useCurrentUser } from '@/entities/session';
import { useLogoutAction } from '@/features/logout';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/shared/ui';
import { Logo } from '@/widgets/logo';
import { getInitials, routes } from '@/shared/lib';
import styles from './Header.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

const newFormClass = ({ isActive }: { isActive: boolean }) =>
	`${styles.link} ${styles.linkPrimary}${isActive ? ` ${styles.linkPrimaryActive}` : ''}`;

export const Header = () => {
	const currentUser = useCurrentUser();
	const navigate = useNavigate();
	const logout = useLogoutAction();

	const initials = currentUser
		? getInitials(currentUser.firstName, currentUser.lastName)
		: '?';

	const handleProfileClick = () => navigate(routes.profile);

	return (
		<header className={styles.header}>
			<Logo />
			<nav className={styles.nav}>
				<NavLink to={routes.home} end className={linkClass}>
					Главная
				</NavLink>
				<NavLink to={routes.formNew} className={newFormClass}>
					Новая форма
				</NavLink>
			</nav>
			<div className={styles.headerRight}>
				<DropdownMenu>
					<DropdownMenuTrigger
						aria-label="Меню пользователя"
						className={styles.avatar}
					>
						{initials}
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={handleProfileClick}>
							Профиль
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className={styles.menuLogout}
							onClick={logout}
						>
							Выход
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
};
