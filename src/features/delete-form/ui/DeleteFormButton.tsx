import { Button } from '@/shared/ui';
import { useDeleteFormAction } from '../model/useDeleteFormAction';

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
			disabled={disabled}
			onClick={() => formId && deleteForm(formId)}
		>
			Удалить форму
		</Button>
	);
};
