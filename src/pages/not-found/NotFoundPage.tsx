import { Link } from 'react-router';
import { buttonVariants } from '@/shared/ui';
import { cn, routes } from '@/shared/lib';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => (
	<div className={styles.page}>
		<p className={styles.code} aria-hidden='true'>
			404
		</p>
		<h1 className={styles.title}>Страница не найдена</h1>
		<p className={styles.description}>
			Возможно, ссылка устарела или страница была удалена.
		</p>
		<Link
			to={routes.home}
			className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 text-base')}
		>
			На главную
		</Link>
	</div>
);
