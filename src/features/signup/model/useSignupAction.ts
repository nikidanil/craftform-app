import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	createUser,
	findUserByEmail,
	type User,
} from '@/entities/user';
import { useSessionStore } from '@/entities/session';
import type { SignupValues } from './schema';

export type SignupStatus = 'idle' | 'pending' | 'success' | 'error';

const EMAIL_TAKEN = 'Введенный Email уже занят';
const GENERIC_ERROR = 'Не удалось зарегистрироваться. Попробуйте ещё раз.';

export const useSignupAction = () => {
	const navigate = useNavigate();
	const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
	const [status, setStatus] = useState<SignupStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signup = useCallback(
		async (input: SignupValues) => {
			setStatus('pending');
			setErrorMessage(null);
			try {
				const existing = await findUserByEmail(input.email);
				if (existing) {
					setStatus('error');
					setErrorMessage(EMAIL_TAKEN);
					return;
				}
				const created: User = await createUser({
					firstName: input.firstName,
					lastName: input.lastName,
					email: input.email,
					password: input.password,
				});
				setCurrentUser(created);
				setStatus('success');
				navigate('/', { replace: true });
			} catch {
				setStatus('error');
				setErrorMessage(GENERIC_ERROR);
			}
		},
		[setCurrentUser, navigate],
	);

	return { signup, status, errorMessage };
};
