import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSessionStore } from '@/entities/session';

export const useLogoutAction = () => {
	const navigate = useNavigate();
	const clearSession = useSessionStore((state) => state.clearSession);

	return useCallback(() => {
		clearSession();
		navigate('/login', { replace: true });
	}, [clearSession, navigate]);
};
