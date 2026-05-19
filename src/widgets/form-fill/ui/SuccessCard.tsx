import { CheckCircle } from 'lucide-react';
import styles from './SuccessCard.module.css';

export const SuccessCard = () => (
	<div className={styles.successCard}>
		<div className={styles.successIcon}>
			<CheckCircle size={32} strokeWidth={1.5} aria-hidden="true" />
		</div>
		<h2 className={styles.successTitle}>Спасибо за ответ!</h2>
		<p className={styles.successText}>Ваш отклик отправлен</p>
	</div>
);
