import { Navigate, Outlet } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';

export const ProtectedRoute = () => {
	const isAuthenticated = useIsAuthenticated();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	return <Outlet />;
};
