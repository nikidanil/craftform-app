import { Link, useLocation } from 'react-router';
import {
	Alert,
	AlertDescription,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui';
import { LoginForm } from '@/features/login';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
	const location = useLocation();
	const state = location.state as { message?: string } | null;
	const flashMessage = state?.message;

	return (
		<div className={styles.page}>
			<div className={styles.wrapper}>
				<Link to='/' className={styles.brand}>
					<span className={styles.brandIcon} aria-hidden>
						✦
					</span>
					<span className={styles.brandName}>FormCraft</span>
				</Link>

				<Card className={styles.card}>
					<CardHeader>
						<CardTitle className={styles.title}>
							С возвращением
						</CardTitle>
						<CardDescription className={styles.subtitle}>
							Войдите, чтобы управлять своими формами
						</CardDescription>
					</CardHeader>
					<CardContent>
						{flashMessage ? (
							<Alert className={styles.flash}>
								<AlertDescription>{flashMessage}</AlertDescription>
							</Alert>
						) : null}
						<LoginForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
