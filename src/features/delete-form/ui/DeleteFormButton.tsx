import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
} from '@/shared/ui';
import { useDeleteFormAction } from '../model/useDeleteFormAction';
import styles from './DeleteFormButton.module.css';

type Props = {
	formId: string | undefined;
	iconOnly?: boolean;
};

export const DeleteFormButton = ({ formId, iconOnly = false }: Props) => {
	const { deleteForm, error, pending } = useDeleteFormAction();
	const [open, setOpen] = useState(false);
	const disabled = !formId || pending;

	const handleDelete = async () => {
		if (!formId) return;
		const success = await deleteForm(formId);
		if (success) setOpen(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				disabled={disabled}
				render={
					<Button
						type='button'
						variant='destructive'
						size={iconOnly ? 'icon' : 'lg'}
						disabled={disabled}
						aria-label={iconOnly ? 'Удалить форму' : undefined}
						className={iconOnly ? styles.iconBtn : styles.btn}
					>
						<Trash2 strokeWidth={2.5} aria-hidden />
						{!iconOnly && 'Удалить форму'}
					</Button>
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Удалить форму?</AlertDialogTitle>
					<AlertDialogDescription>
						Форма и все её отклики будут удалены безвозвратно. Это
						действие нельзя отменить.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<p role='alert' className={styles.error}>
						{error.message}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogClose
						render={
							<Button type='button' variant='outline'>
								Отмена
							</Button>
						}
					/>
					<Button
						type='button'
						variant='destructive'
						disabled={pending}
						onClick={() => void handleDelete()}
					>
						{pending ? 'Удаление…' : 'Удалить'}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
