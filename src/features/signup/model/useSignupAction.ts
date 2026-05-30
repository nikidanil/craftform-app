import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createUser, findUserByEmail } from '@/entities/user';
import { useSetCurrentUser } from '@/entities/session';
import { routes } from '@/shared/lib';
import type { SignupValues } from './schema';

export type SignupStatus = 'idle' | 'pending' | 'success' | 'error';

const EMAIL_TAKEN = 'Введенный Email уже занят';
const GENERIC_ERROR = 'Не удалось зарегистрироваться. Попробуйте ещё раз.';

/**
 * Действие регистрации: проверяет, что email свободен, создаёт пользователя,
 * кладёт его в сессию и уводит на главную.
 *
 * Зачем: перед созданием — `findUserByEmail` для проверки дубля; на занятый email
 * отдельное сообщение (`EMAIL_TAKEN`), на прочие сбои — общее. Здесь раскрытие
 * занятости email допустимо (это сам владелец регистрируется). `navigate(replace)`
 * убирает форму регистрации из истории.
 *
 * @returns `{ signup, status, errorMessage }` — действие и состояние формы
 *   (`status`: idle | pending | success | error)
 * @example
 * const { signup, status, errorMessage } = useSignupAction();
 * await signup({ firstName, lastName, email, password, confirmPassword });
 */
export const useSignupAction = () => {
	const navigate = useNavigate();
	const setCurrentUser = useSetCurrentUser();
	const [status, setStatus] = useState<SignupStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signup = async (input: SignupValues) => {
		setStatus('pending');
		setErrorMessage(null);
		try {
			const existing = await findUserByEmail(input.email);
			if (existing) {
				setStatus('error');
				setErrorMessage(EMAIL_TAKEN);
				return;
			}
			const created = await createUser({
				firstName: input.firstName,
				lastName: input.lastName,
				email: input.email,
				password: input.password,
			});
			setCurrentUser(created);
			setStatus('success');
			navigate(routes.home, { replace: true });
		} catch {
			setStatus('error');
			setErrorMessage(GENERIC_ERROR);
		}
	};

	return { signup, status, errorMessage };
};
