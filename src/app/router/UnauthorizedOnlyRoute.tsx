import { Navigate, Outlet } from 'react-router';
import { useIsAuthenticated } from '@/entities/session';

const REDIRECT_MESSAGE = 'Вы уже вошли в систему';

export const UnauthorizedOnlyRoute = () => {
	const isAuthenticated = useIsAuthenticated();

	if (isAuthenticated) {
		return (
			<Navigate
				to='/'
				replace
				state={{ message: REDIRECT_MESSAGE }}
			/>
		);
	}

	return <Outlet />;
};
