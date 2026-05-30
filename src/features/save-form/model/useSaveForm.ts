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

/**
 * Сохранение формы в одном из двух режимов — создание или редактирование.
 *
 * Зачем: режим задаётся discriminated-union `options` (`{ mode: 'create' }` либо
 * `{ mode: 'edit'; formId }`) — TS гарантирует наличие `formId` только в edit.
 * В режиме create требуется авторизация (иначе бросает ошибку) и после успеха
 * происходит переход на редактор созданной формы. `save` возвращает `Form` при
 * успехе или `null` при ошибке (детали — в `error`).
 *
 * @param options — `{ mode: 'create' }` или `{ mode: 'edit'; formId: string }`
 * @returns `{ save, status, error, reset }`; `save(input: FormInput)` →
 *   `Promise<Form | null>` (`status`: idle | pending | success | error)
 * @example
 * const { save, status } = useSaveForm({ mode: 'edit', formId });
 * const saved = await save(formInput);
 */
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
