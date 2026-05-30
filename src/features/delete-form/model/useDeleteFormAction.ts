import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteForm } from '@/entities/form';
import { submissionKeys } from '@/entities/submission';
import { routes } from '@/shared/lib';

/**
 * Действие удаления формы: оборачивает мутацию `useDeleteForm`, после успеха
 * инвалидирует счётчики откликов и уводит на главную.
 *
 * Зачем: каскадное удаление формы и её откликов делает `useDeleteForm`; здесь
 * через его `onSuccess` поднимается инвалидация `submissionKeys.all` (счётчики на
 * списке форм) — entities/form не знает про submission. `finally` гасит `pending`
 * даже при ошибке. `deleteForm` возвращает `boolean` (успех).
 *
 * @returns `{ deleteForm, error, pending }`; `deleteForm(formId)` → `Promise<boolean>`
 * @example
 * const { deleteForm, pending } = useDeleteFormAction();
 * if (await deleteForm(form.id)) toast('Форма удалена');
 */
export const useDeleteFormAction = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const deleteMutation = useDeleteForm({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: submissionKeys.all });
		},
	});
	const [error, setError] = useState<Error | null>(null);
	const [pending, setPending] = useState(false);

	const deleteForm = async (formId: string): Promise<boolean> => {
		setPending(true);
		setError(null);
		try {
			await deleteMutation.mutateAsync(formId);
			navigate(routes.home);
			return true;
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError
					: new Error(String(caughtError)),
			);
			return false;
		} finally {
			setPending(false);
		}
	};

	return { deleteForm, error, pending };
};
