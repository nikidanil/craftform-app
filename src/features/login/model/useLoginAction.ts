import { useState } from 'react';
import { useNavigate } from 'react-router';
import { findUserByEmail, toPublicUser } from '@/entities/user';
import { useSetCurrentUser } from '@/entities/session';
import { routes } from '@/shared/lib';
import type { LoginValues } from './schema';

export type LoginStatus = 'idle' | 'pending' | 'success' | 'error';

const GENERIC_LOGIN_ERROR = 'Неверный Email или пароль';

/**
 * Действие входа: ищет пользователя по email, сверяет пароль, кладёт публичную
 * версию пользователя в сессию и уводит на главную.
 *
 * Зачем: при «не найден» и «неверный пароль» — ОДНА обобщённая ошибка
 * (`Неверный Email или пароль`): не раскрываем, существует ли email (security).
 * `navigate(replace: true)` — чтобы кнопка «назад» не вернула на форму входа.
 * `toPublicUser` срезает пароль до попадания в стор.
 *
 * @returns `{ login, status, errorMessage }` — действие и состояние формы
 *   (`status`: idle | pending | success | error)
 * @example
 * const { login, status, errorMessage } = useLoginAction();
 * await login({ email, password });
 */
export const useLoginAction = () => {
	const navigate = useNavigate();
	const setCurrentUser = useSetCurrentUser();
	const [status, setStatus] = useState<LoginStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const login = async (input: LoginValues) => {
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
			navigate(routes.home, { replace: true });
		} catch {
			setStatus('error');
			setErrorMessage(GENERIC_LOGIN_ERROR);
		}
	};

	return { login, status, errorMessage };
};
