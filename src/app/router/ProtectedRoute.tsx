import { Navigate, Outlet } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';
import { routes } from '@/shared/lib';

export const ProtectedRoute = () => {
	const isAuthenticated = useIsAuthenticated();

	if (!isAuthenticated) {
		return <Navigate to={routes.login} replace />;
	}

	return <Outlet />;
};
