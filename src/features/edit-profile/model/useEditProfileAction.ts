import { useState } from 'react';
import { findUserByEmail, updateUser } from '@/entities/user';
import { useCurrentUser, useSetCurrentUser } from '@/entities/session';
import type { ProfileValues } from './schema';

export type EditProfileStatus = 'idle' | 'pending' | 'success' | 'error';

const EMAIL_TAKEN = 'Введенный Email уже занят';
const GENERIC_ERROR = 'Не удалось сохранить изменения. Попробуйте ещё раз.';

export const useEditProfileAction = () => {
	const currentUser = useCurrentUser();
	const setCurrentUser = useSetCurrentUser();
	const [status, setStatus] = useState<EditProfileStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const save = async (values: ProfileValues): Promise<boolean> => {
		if (!currentUser || status === 'pending') return false;
		setStatus('pending');
		setErrorMessage(null);
		try {
			const existing = await findUserByEmail(values.email);
			if (existing && existing.id !== currentUser.id) {
				setStatus('error');
				setErrorMessage(EMAIL_TAKEN);
				return false;
			}
			const updated = await updateUser({
				id: currentUser.id,
				patch: {
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
				},
			});
			setCurrentUser(updated);
			setStatus('success');
			return true;
		} catch {
			setStatus('error');
			setErrorMessage(GENERIC_ERROR);
			return false;
		}
	};

	const reset = () => {
		setStatus('idle');
		setErrorMessage(null);
	};

	return { save, status, errorMessage, reset };
};
