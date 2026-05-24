import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	useCreateForm,
	useUpdateForm,
	type FormInput,
} from '@/entities/form';
import { useCurrentUser } from '@/entities/session';

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

	const save = useCallback(
		async (input: FormInput) => {
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
					navigate(`/forms/${created.id}/edit`);
					return created;
				}
				const updated = await updateForm.mutateAsync({
					formId: options.formId,
					patch: input,
				});
				setStatus('success');
				return updated;
			} catch (e) {
				const err = e instanceof Error ? e : new Error(String(e));
				setError(err);
				setStatus('error');
				return null;
			}
		},
		[createForm, updateForm, navigate, options, currentUser],
	);

	const reset = useCallback(() => {
		setStatus('idle');
		setError(null);
	}, []);

	return { save, status, error, reset };
};
