import { useNavigate } from 'react-router';
import { useClearSession } from '@/entities/session';
import { routes } from '@/shared/lib';

/**
 * Возвращает функцию выхода: очищает сессию и уводит на страницу входа
 * (`replace: true` — форма входа перекрывает текущую запись истории).
 */
export const useLogoutAction = () => {
	const navigate = useNavigate();
	const clearSession = useClearSession();

	return () => {
		clearSession();
		navigate(routes.login, { replace: true });
	};
};
