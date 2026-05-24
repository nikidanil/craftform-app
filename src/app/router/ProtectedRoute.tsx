import { Navigate, Outlet, useLocation } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';

const REDIRECT_MESSAGE =
	'Для просмотра информации о пользователе необходимо войти в систему';

export const ProtectedRoute = () => {
	const isAuthenticated = useIsAuthenticated();
	const location = useLocation();

	if (!isAuthenticated) {
		return (
			<Navigate
				to='/login'
				replace
				state={{
					message: REDIRECT_MESSAGE,
					from: location.pathname + location.search,
				}}
			/>
		);
	}

	return <Outlet />;
};
