import { Navigate, Outlet } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';

export const UnauthorizedOnlyRoute = () => {
	const isAuthenticated = useIsAuthenticated();

	if (isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	return <Outlet />;
};
