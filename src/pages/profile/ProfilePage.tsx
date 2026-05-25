import { Link } from 'react-router';

import { useCurrentUser } from '@/entities/session';
import { ProfileForm } from '@/features/edit-profile';
import { getInitials, routes } from '@/shared/lib';

import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
	const user = useCurrentUser();

	if (!user) {
		return null;
	}

	return (
		<section className={styles.page}>
			<nav className={styles.breadcrumb} aria-label='Хлебные крошки'>
				<Link to={routes.home}>Главная</Link>
				<span className={styles.breadcrumbSep} aria-hidden>
					›
				</span>
				<span aria-current='page'>Профиль</span>
			</nav>

			<div className={styles.card}>
				<div className={styles.cardHead}>
					<div className={styles.avatar} aria-hidden>
						{getInitials(user.firstName, user.lastName)}
					</div>
					<div className={styles.headInfo}>
						<h1 className={styles.name}>
							{user.firstName} {user.lastName}
						</h1>
						<p className={styles.email}>{user.email}</p>
					</div>
				</div>

				<div className={styles.cardBody}>
					<ProfileForm user={user} />
				</div>
			</div>
		</section>
	);
};
