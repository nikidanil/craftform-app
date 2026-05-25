import { Alert, AlertTitle } from '../alert';
import { useToastStore } from './store';
import styles from './ToastViewport.module.css';

export const ToastViewport = () => {
	const toasts = useToastStore((state) => state.toasts);
	const dismissToast = useToastStore((state) => state.dismissToast);

	if (toasts.length === 0) {
		return null;
	}

	return (
		<div className={styles.viewport} role='region' aria-label='Уведомления'>
			{toasts.map((toastItem) => (
				<Alert
					key={toastItem.id}
					variant={toastItem.variant}
					role={toastItem.variant === 'destructive' ? 'alert' : 'status'}
					className={styles.toast}
					onClick={() => dismissToast(toastItem.id)}
				>
					<AlertTitle>{toastItem.message}</AlertTitle>
				</Alert>
			))}
		</div>
	);
};
