import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useDeleteFormAction } from '../model/useDeleteFormAction';
import styles from './DeleteFormButton.module.css';

type Props = {
	formId: string | undefined;
};

export const DeleteFormButton = ({ formId }: Props) => {
	const { deleteForm, pending } = useDeleteFormAction();
	const disabled = !formId || pending;

	return (
		<Button
			type='button'
			variant='destructive'
			size='lg'
			disabled={disabled}
			onClick={() => formId && deleteForm(formId)}
			className={styles.btn}
		>
			<Trash2 strokeWidth={2.5} aria-hidden />
			Удалить форму
		</Button>
	);
};
