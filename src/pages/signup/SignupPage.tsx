import { Link } from 'react-router';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui';
import { SignupForm } from '@/features/signup';
import styles from './SignupPage.module.css';

export const SignupPage = () => (
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
					<CardTitle className={styles.title}>Создать аккаунт</CardTitle>
					<CardDescription className={styles.subtitle}>
						Начните создавать формы уже сегодня — бесплатно
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignupForm />
				</CardContent>
			</Card>
		</div>
	</div>
);
