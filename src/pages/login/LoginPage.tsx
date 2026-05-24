import { Link } from 'react-router';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui';
import { routes } from '@/shared/lib';
import { LoginForm } from '@/features/login';
import styles from './LoginPage.module.css';

export const LoginPage = () => (
	<div className={styles.page}>
		<div className={styles.wrapper}>
			<Link to={routes.home} className={styles.brand}>
				<span className={styles.brandIcon} aria-hidden>
					✦
				</span>
				<span className={styles.brandName}>FormCraft</span>
			</Link>

			<Card className={styles.card}>
				<CardHeader>
					<CardTitle className={styles.title}>С возвращением</CardTitle>
					<CardDescription className={styles.subtitle}>
						Войдите, чтобы управлять своими формами
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	</div>
);
