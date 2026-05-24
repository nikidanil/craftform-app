import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useClearSession } from '@/entities/session';

export const useLogoutAction = () => {
	const navigate = useNavigate();
	const clearSession = useClearSession();

	return useCallback(() => {
		clearSession();
		navigate('/login', { replace: true });
	}, [clearSession, navigate]);
};
