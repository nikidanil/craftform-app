import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { NotFoundPage } from '@/pages/not-found';

describe('NotFoundPage', () => {
	it('со страницы 404 ссылка «На главную» уводит на главный маршрут', async () => {
		const router = createMemoryRouter(
			[
				{ path: '/', element: <div data-testid='home'>home</div> },
				{ path: '*', element: <NotFoundPage /> },
			],
			{ initialEntries: ['/no-such-page-xyz'] },
		);
		render(<RouterProvider router={router} />);

		// исходно — пользователь на несуществующем маршруте
		expect(screen.getByText('Страница не найдена')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /на главную/i }),
		);

		expect(await screen.findByTestId('home')).toBeInTheDocument();
	});
});
