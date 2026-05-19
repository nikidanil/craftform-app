import type { SaveStatus } from '../model/useSaveForm';
import styles from './SaveFormStatus.module.css';

type Props = {
	status: SaveStatus;
	error: Error | null;
};

export const SaveFormStatus = ({ status, error }: Props) => {
	if (status === 'success') {
		return (
			<div role='status' className={styles.success}>
				Форма успешно сохранена
			</div>
		);
	}

	if (status === 'error') {
		return (
			<div role='alert' className={styles.error}>
				Не удалось сохранить форму
				{error ? `: ${error.message}` : ''}
			</div>
		);
	}

	return null;
};
