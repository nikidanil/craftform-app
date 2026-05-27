import { Link2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import styles from './CopyFormLinkButton.module.css';

type Props = {
	onCopy: () => void;
	disabled?: boolean;
};

export const CopyFormLinkButton = ({ onCopy, disabled = false }: Props) => (
	<Button
		type='button'
		variant='outline'
		size='lg'
		disabled={disabled}
		onClick={onCopy}
		className={styles.btn}
	>
		<Link2 strokeWidth={2.5} aria-hidden />
		Скопировать ссылку
	</Button>
);
