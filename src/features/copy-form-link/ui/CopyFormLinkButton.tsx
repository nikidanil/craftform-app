import { Link2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useCopyFormLink } from '../model/useCopyFormLink';
import styles from './CopyFormLinkButton.module.css';

type Props = {
	formId: string | undefined;
};

export const CopyFormLinkButton = ({ formId }: Props) => {
	const { copy } = useCopyFormLink();
	const disabled = !formId;

	return (
		<Button
			type='button'
			variant='outline'
			size='lg'
			disabled={disabled}
			onClick={() => copy(formId)}
			className={styles.btn}
		>
			<Link2 strokeWidth={2.5} aria-hidden />
			Скопировать ссылку
		</Button>
	);
};
