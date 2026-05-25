import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { http } from '@/shared/api';
import { useSessionStore } from '@/entities/session';
import { makeTestQueryClient } from '@/test/test-utils';

import { appRoutes } from '../router/router';

vi.mock('@/shared/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/shared/api')>();
	return { ...actual, http: vi.fn() };
});
const mockedHttp = vi.mocked(http);

type Stored = Record<string, unknown> & { id: string; formId?: string };

/** In-memory мок json-server: формы и отклики живут между запросами теста. */
const setupApi = () => {
	const forms = new Map<string, Stored>();
	const responses: Stored[] = [];

	mockedHttp.mockImplementation(async (url, init) => {
		const method = init?.method ?? 'GET';
		const body =
			init?.body && typeof init.body === 'object' && !Array.isArray(init.body)
				? (init.body as Stored)
				: undefined;

		if (url === '/api/forms' && method === 'POST' && body) {
			forms.set(body.id, body);
			return body;
		}
		if (url.startsWith('/api/forms?authorId=')) {
			const authorId = decodeURIComponent(url.split('authorId=')[1]);
			return [...forms.values()].filter((form) => form.authorId === authorId);
		}
		const formDetail = url.match(/^\/api\/forms\/([^/?]+)$/);
		if (formDetail && method === 'GET') {
			return forms.get(formDetail[1]) ?? null;
		}

		if (url === '/api/responses' && method === 'POST' && body) {
			responses.push(body);
			return body;
		}
		if (url.startsWith('/api/responses?formId=')) {
			const formId = decodeURIComponent(url.split('formId=')[1]);
			return responses.filter((response) => response.formId === formId);
		}
		if (url === '/api/responses' && method === 'GET') {
			return responses;
		}
		const responseDetail = url.match(/^\/api\/responses\/([^/?]+)$/);
		if (responseDetail && method === 'GET') {
			return responses.find((response) => response.id === responseDetail[1]) ?? null;
		}
		return null;
	});

	return { responses };
};

const renderApp = (initialPath: string) => {
	const router = createMemoryRouter(appRoutes, {
		initialEntries: [initialPath],
	});
	render(
		<QueryClientProvider client={makeTestQueryClient()}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	return router;
};

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
};

describe('Сквозной сценарий: форма от создания до отклика', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		localStorage.clear();
		useSessionStore.setState({ currentUser: seedUser });
	});

	it('создать форму → пройти → увидеть отклик в списке и в просмотре', async () => {
		const { responses } = setupApi();
		const router = renderApp('/forms/new');
		const user = userEvent.setup();

		// 1. Конструктор: заголовок + один вопрос с телом.
		await user.type(screen.getByLabelText('Название формы'), 'Опрос гостей');
		await user.click(screen.getByRole('button', { name: 'Короткий текст' }));
		await user.type(screen.getByLabelText('Текст вопроса'), 'Ваше имя');

		// 2. Сохранить → редирект на /forms/:id/edit.
		await user.click(screen.getByRole('button', { name: /сохранить форму/i }));
		await waitFor(() =>
			expect(router.state.location.pathname).toMatch(/^\/forms\/.+\/edit$/),
		);
		const formId = router.state.location.pathname.split('/')[2];

		// 3. Открыть публичную страницу прохождения.
		await act(async () => {
			await router.navigate(`/forms/${formId}`);
		});
		expect(
			await screen.findByRole('heading', { name: 'Опрос гостей' }),
		).toBeInTheDocument();

		// 4. Заполнить и отправить отклик.
		await user.type(screen.getByLabelText(/ваше имя/i), 'Гость');
		const submitButton = screen.getByRole('button', { name: /отправить/i });
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		await user.click(submitButton);
		expect(await screen.findByText(/спасибо за ответ/i)).toBeInTheDocument();
		expect(responses).toHaveLength(1);

		// 5. Список откликов формы — виден отклик №1.
		await act(async () => {
			await router.navigate(`/forms/${formId}/responses`);
		});
		expect(await screen.findByText(/Отклик №1/)).toBeInTheDocument();

		// 6. Просмотр одного отклика — виден ответ на вопрос.
		const responseId = responses[0].id;
		await act(async () => {
			await router.navigate(`/forms/${formId}/responses/${responseId}`);
		});
		expect(await screen.findByText('Ваше имя')).toBeInTheDocument();
		expect(await screen.findByText('Гость')).toBeInTheDocument();
	});
});
