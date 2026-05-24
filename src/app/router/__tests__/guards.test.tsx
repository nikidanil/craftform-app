import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
	createMemoryRouter,
	RouterProvider,
	useLocation,
} from 'react-router';

import { useSessionStore } from '@/entities/session';
import { ProtectedRoute } from '../ProtectedRoute';
import { UnauthorizedOnlyRoute } from '../UnauthorizedOnlyRoute';

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

const FlashSpy = ({ testId }: { testId: string }) => {
	const location = useLocation();
	const state = location.state as { message?: string } | null;
	return (
		<div data-testid={testId}>
			<span data-testid={`${testId}-path`}>{location.pathname}</span>
			<span data-testid={`${testId}-msg`}>{state?.message ?? ''}</span>
		</div>
	);
};

describe('ProtectedRoute', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('анонимного пользователя редиректит на /login и кладёт flash в location.state', () => {
		const routes = [
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/secret', element: <div>secret</div> },
				],
			},
			{ path: '/login', element: <FlashSpy testId='login' /> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/secret'],
		});
		render(<RouterProvider router={router} />);

		expect(screen.getByTestId('login-path')).toHaveTextContent('/login');
		expect(screen.getByTestId('login-msg')).toHaveTextContent(
			'Для просмотра информации о пользователе необходимо войти в систему',
		);
	});

	it('авторизованного пользователя пропускает к защищённому контенту', () => {
		useSessionStore.setState({ currentUser: seedUser });

		const routes = [
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/secret', element: <div data-testid='secret'>secret</div> },
				],
			},
			{ path: '/login', element: <div>login</div> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/secret'],
		});
		render(<RouterProvider router={router} />);

		expect(screen.getByTestId('secret')).toBeInTheDocument();
	});
});

describe('UnauthorizedOnlyRoute', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('авторизованного редиректит на / и кладёт «Вы уже вошли в систему» в location.state', () => {
		useSessionStore.setState({ currentUser: seedUser });

		const routes = [
			{
				element: <UnauthorizedOnlyRoute />,
				children: [
					{ path: '/login', element: <div>login</div> },
				],
			},
			{ path: '/', element: <FlashSpy testId='home' /> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/login'],
		});
		render(<RouterProvider router={router} />);

		expect(screen.getByTestId('home-path')).toHaveTextContent('/');
		expect(screen.getByTestId('home-msg')).toHaveTextContent(
			'Вы уже вошли в систему',
		);
	});

	it('анонимного пропускает к /login', () => {
		const routes = [
			{
				element: <UnauthorizedOnlyRoute />,
				children: [
					{ path: '/login', element: <div data-testid='login'>login</div> },
				],
			},
			{ path: '/', element: <div>home</div> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/login'],
		});
		render(<RouterProvider router={router} />);

		expect(screen.getByTestId('login')).toBeInTheDocument();
	});
});
