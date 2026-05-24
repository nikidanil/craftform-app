import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useClearSession } from '@/entities/session';
import { routes } from '@/shared/lib';

export const useLogoutAction = () => {
	const navigate = useNavigate();
	const clearSession = useClearSession();

	return useCallback(() => {
		clearSession();
		navigate(routes.login, { replace: true });
	}, [clearSession, navigate]);
};
