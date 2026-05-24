import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
	useCreateForm,
	useUpdateForm,
	type FormInput,
} from '@/entities/form';
import { useCurrentUser } from '@/entities/session';
import { routes } from '@/shared/lib';

type CreateOptions = { mode: 'create' };
type EditOptions = { mode: 'edit'; formId: string };
type Options = CreateOptions | EditOptions;

export type SaveStatus = 'idle' | 'pending' | 'success' | 'error';

export const useSaveForm = (options: Options) => {
	const navigate = useNavigate();
	const createForm = useCreateForm();
	const updateForm = useUpdateForm();
	const currentUser = useCurrentUser();
	const [status, setStatus] = useState<SaveStatus>('idle');
	const [error, setError] = useState<Error | null>(null);

	const save = async (input: FormInput) => {
		setStatus('pending');
		setError(null);
		try {
			if (options.mode === 'create') {
				if (!currentUser) {
					throw new Error(
						'Создание формы доступно только авторизованному пользователю',
					);
				}
				const created = await createForm.mutateAsync({
					input,
					authorId: currentUser.id,
				});
				setStatus('success');
				navigate(routes.formEdit(created.id));
				return created;
			}
			const updated = await updateForm.mutateAsync({
				formId: options.formId,
				patch: input,
			});
			setStatus('success');
			return updated;
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError
					: new Error(String(caughtError)),
			);
			setStatus('error');
			return null;
		}
	};

	const reset = () => {
		setStatus('idle');
		setError(null);
	};

	return { save, status, error, reset };
};
