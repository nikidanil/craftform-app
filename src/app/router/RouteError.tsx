import { Link, useRouteError } from 'react-router';
import { Button, buttonVariants } from '@/shared/ui';
import { cn, routes } from '@/shared/lib';
import styles from './RouteError.module.css';

/**
 * Error boundary уровня маршрутизации. Ловит непредвиденные ошибки рендера
 * в любом дочернем маршруте и показывает дружелюбный экран вместо белого
 * экрана. Подключён как `errorElement` корневого маршрута.
 */
export const RouteError = () => {
	const error: unknown = useRouteError();

	if (import.meta.env.DEV) {
		console.error('Необработанная ошибка маршрута:', error);
	}

	return (
		<div className={styles.page}>
			<h1 className={styles.title}>Что-то пошло не так</h1>
			<p className={styles.description}>
				Произошла непредвиденная ошибка. Попробуйте обновить страницу или
				вернуться на главную.
			</p>
			<div className={styles.actions}>
				<Button
					type='button'
					size='lg'
					className={styles.actionBtn}
					onClick={() => window.location.reload()}
				>
					Обновить страницу
				</Button>
				<Link
					to={routes.home}
					className={cn(
						buttonVariants({ variant: 'secondary', size: 'lg' }),
						styles.actionBtn,
					)}
				>
					На главную
				</Link>
			</div>
		</div>
	);
};
