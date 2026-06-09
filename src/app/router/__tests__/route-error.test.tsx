import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { RouteError } from '../layouts/RouteError';

const Thrower = () => {
	throw new Error('boom');
};

const renderErroredRoute = () =>
	render(
		<RouterProvider
			router={createMemoryRouter(
				[
					{
						path: '/broken',
						element: <Thrower />,
						errorElement: <RouteError />,
					},
					{ path: '/', element: <div data-testid='home'>home</div> },
				],
				{ initialEntries: ['/broken'] },
			)}
		/>,
	);

describe('RouteError (error boundary маршрута)', () => {
	beforeEach(() => {
		// React логирует пойманную ошибку — глушим, чтобы не засорять вывод
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('с экрана ошибки ссылка «На главную» уводит на главный маршрут', async () => {
		renderErroredRoute();

		// исходно — вместо упавшего маршрута показан экран ошибки
		expect(
			await screen.findByText('Что-то пошло не так'),
		).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /на главную/i }),
		);

		expect(await screen.findByTestId('home')).toBeInTheDocument();
	});
});
