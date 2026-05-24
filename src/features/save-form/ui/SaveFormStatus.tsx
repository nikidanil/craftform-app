import type { SaveStatus } from '../model/useSaveForm';
import styles from './SaveFormStatus.module.css';

type Props = {
	status: SaveStatus;
};

export const SaveFormStatus = ({ status }: Props) => {
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
			</div>
		);
	}

	return null;
};
