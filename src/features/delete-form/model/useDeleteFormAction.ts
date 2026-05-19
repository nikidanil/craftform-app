import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteForm } from '@/entities/form';

export const useDeleteFormAction = () => {
	const navigate = useNavigate();
	const deleteMutation = useDeleteForm();
	const [error, setError] = useState<Error | null>(null);
	const [pending, setPending] = useState(false);

	const deleteForm = useCallback(
		async (formId: string) => {
			setPending(true);
			setError(null);
			try {
				await deleteMutation.mutateAsync(formId);
				navigate('/');
			} catch (e) {
				setError(e instanceof Error ? e : new Error(String(e)));
			} finally {
				setPending(false);
			}
		},
		[deleteMutation, navigate],
	);

	return { deleteForm, error, pending };
};
