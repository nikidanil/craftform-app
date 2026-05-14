import { Save } from 'lucide-react';
import { Button } from '@/shared/ui';
import styles from './SaveFormButton.module.css';

type Props = {
	disabled?: boolean;
	pending?: boolean;
};

export const SaveFormButton = ({ disabled, pending }: Props) => (
	<Button
		type='submit'
		size='lg'
		disabled={disabled || pending}
		className={styles.btn}
	>
		<Save strokeWidth={2.5} aria-hidden />
		{pending ? 'Сохранение…' : 'Сохранить форму'}
	</Button>
);
