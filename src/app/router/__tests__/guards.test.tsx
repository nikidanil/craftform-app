import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { useSessionStore } from '@/entities/session';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { UnauthorizedOnlyRoute } from '../guards/UnauthorizedOnlyRoute';

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

describe('ProtectedRoute', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('анонимного пользователя редиректит на /login', async () => {
		const routes = [
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/secret', element: <div>secret</div> },
				],
			},
			{ path: '/login', element: <div data-testid='login'>login</div> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/secret'],
		});
		render(<RouterProvider router={router} />);

		expect(await screen.findByTestId('login')).toBeInTheDocument();
	});

	it('авторизованного пользователя пропускает к защищённому контенту', async () => {
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

		expect(await screen.findByTestId('secret')).toBeInTheDocument();
	});
});

describe('UnauthorizedOnlyRoute', () => {
	beforeEach(() => {
		localStorage.clear();
		useSessionStore.setState({ currentUser: null });
	});

	it('авторизованного редиректит на /', async () => {
		useSessionStore.setState({ currentUser: seedUser });

		const routes = [
			{
				element: <UnauthorizedOnlyRoute />,
				children: [
					{ path: '/login', element: <div>login</div> },
				],
			},
			{ path: '/', element: <div data-testid='home'>home</div> },
		];
		const router = createMemoryRouter(routes, {
			initialEntries: ['/login'],
		});
		render(<RouterProvider router={router} />);

		expect(await screen.findByTestId('home')).toBeInTheDocument();
	});

	it('анонимного пропускает к /login', async () => {
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

		expect(await screen.findByTestId('login')).toBeInTheDocument();
	});
});
