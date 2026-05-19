import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	useCreateForm,
	useUpdateForm,
	type FormInput,
} from '@/entities/form';

type CreateOptions = { mode: 'create' };
type EditOptions = { mode: 'edit'; formId: string };
type Options = CreateOptions | EditOptions;

export type SaveStatus = 'idle' | 'pending' | 'success' | 'error';

export const useSaveForm = (options: Options) => {
	const navigate = useNavigate();
	const createForm = useCreateForm();
	const updateForm = useUpdateForm();
	const [status, setStatus] = useState<SaveStatus>('idle');
	const [error, setError] = useState<Error | null>(null);

	const save = useCallback(
		async (input: FormInput) => {
			setStatus('pending');
			setError(null);
			try {
				if (options.mode === 'create') {
					const created = await createForm.mutateAsync(input);
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
		[createForm, updateForm, navigate, options],
	);

	const reset = useCallback(() => {
		setStatus('idle');
		setError(null);
	}, []);

	return { save, status, error, reset };
};
