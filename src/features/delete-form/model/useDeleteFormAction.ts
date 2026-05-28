import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteForm } from '@/entities/form';
import { routes } from '@/shared/lib';

export const useDeleteFormAction = () => {
	const navigate = useNavigate();
	const deleteMutation = useDeleteForm();
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
