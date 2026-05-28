import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui';
import { SignupForm } from '@/features/signup';
import { Logo } from '@/widgets/logo';
import styles from './SignupPage.module.css';

export const SignupPage = () => (
	<div className={styles.page}>
		<div className={styles.wrapper}>
			<Logo />

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
