import { Navigate, Outlet } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';
import { routes } from '@/shared/lib';

export const UnauthorizedOnlyRoute = () => {
	const isAuthenticated = useIsAuthenticated();

	if (isAuthenticated) {
		return <Navigate to={routes.home} replace />;
	}

	return <Outlet />;
};
