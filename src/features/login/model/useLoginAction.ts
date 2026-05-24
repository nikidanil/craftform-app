import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { findUserByEmail, toPublicUser } from '@/entities/user';
import { useSessionStore } from '@/entities/session';
import type { LoginValues } from './schema';

export type LoginStatus = 'idle' | 'pending' | 'success' | 'error';

const GENERIC_LOGIN_ERROR = 'Неверный Email или пароль';

export const useLoginAction = () => {
	const navigate = useNavigate();
	const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
	const [status, setStatus] = useState<LoginStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const login = useCallback(
		async (input: LoginValues) => {
			setStatus('pending');
			setErrorMessage(null);
			try {
				const record = await findUserByEmail(input.email);
				if (!record || record.password !== input.password) {
					setStatus('error');
					setErrorMessage(GENERIC_LOGIN_ERROR);
					return;
				}
				setCurrentUser(toPublicUser(record));
				setStatus('success');
				navigate('/', { replace: true });
			} catch {
				setStatus('error');
				setErrorMessage(GENERIC_LOGIN_ERROR);
			}
		},
		[setCurrentUser, navigate],
	);

	return { login, status, errorMessage };
};
