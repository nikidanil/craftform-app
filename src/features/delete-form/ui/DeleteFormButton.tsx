import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useDeleteFormAction } from '../model/useDeleteFormAction';
import styles from './DeleteFormButton.module.css';

type Props = {
	formId: string | undefined;
	iconOnly?: boolean;
};

export const DeleteFormButton = ({ formId, iconOnly = false }: Props) => {
	const { deleteForm, pending } = useDeleteFormAction();
	const disabled = !formId || pending;

	return (
		<Button
			type='button'
			variant='destructive'
			size={iconOnly ? 'icon' : 'lg'}
			disabled={disabled}
			onClick={() => formId && deleteForm(formId)}
			aria-label={iconOnly ? 'Удалить форму' : undefined}
			className={iconOnly ? styles.iconBtn : styles.btn}
		>
			<Trash2 strokeWidth={2.5} aria-hidden />
			{!iconOnly && 'Удалить форму'}
		</Button>
	);
};
