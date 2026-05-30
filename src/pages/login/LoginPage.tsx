import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui';
import { LoginForm } from '@/features/login';
import { Logo } from '@/shared/ui';
import styles from './LoginPage.module.css';

export const LoginPage = () => (
	<div className={styles.page}>
		<div className={styles.wrapper}>
			<Logo />

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
