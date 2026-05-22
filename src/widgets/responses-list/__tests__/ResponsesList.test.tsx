import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/test-utils';
import {
	stubIntersectionObserver,
	triggerLastObserver,
	unstubIntersectionObserver,
} from '@/test/mockIntersectionObserver';
import type { Submission } from '@/entities/submission';

import { ResponsesList } from '../ui/ResponsesList';
import type { SortOption } from '../model';

const buildSubmission = (overrides: Partial<Submission> = {}): Submission => ({
	id: 'r-x',
	formId: 'form-7',
	number: 1,
	createdAt: '2026-05-02T14:32:00.000Z',
	answers: [],
	...overrides,
});

type HarnessProps = {
	formTitle?: string;
	responses: Submission[];
	initialSort?: SortOption;
	initialDateFrom?: string;
	initialDateTo?: string;
};

const Harness = ({
	formTitle = 'Опрос',
	responses,
	initialSort = 'date-desc',
	initialDateFrom = '',
	initialDateTo = '',
}: HarnessProps) => {
	const [sort, setSort] = useState<SortOption>(initialSort);
	const [dateFrom, setDateFrom] = useState(initialDateFrom);
	const [dateTo, setDateTo] = useState(initialDateTo);

	return (
		<ResponsesList
			formTitle={formTitle}
			responses={responses}
			sort={sort}
			onSortChange={setSort}
			dateFrom={dateFrom}
			onDateFromChange={setDateFrom}
			dateTo={dateTo}
			onDateToChange={setDateTo}
		/>
	);
};

describe('ResponsesList', () => {
	beforeEach(() => {
		stubIntersectionObserver();
	});

	afterEach(() => {
		unstubIntersectionObserver();
	});

	it('рендерит список с бейджем счётчика и переходит по карточке', async () => {
		const responses: Submission[] = [
			buildSubmission({ id: 'r-1', number: 1 }),
			buildSubmission({ id: 'r-2', number: 2 }),
		];

		const { getCurrentPath } = renderWithProviders(
			<Harness formTitle='Обратная связь' responses={responses} />,
		);

		expect(screen.getByText('Обратная связь')).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: /Отклик №2/ }));
		expect(getCurrentPath()).toBe('/forms/form-7/responses/r-2');
	});

	it('сужающий фильтр dateFrom отрезает всё → EmptyState; очистка возвращает список', async () => {
		const responses: Submission[] = [
			buildSubmission({
				id: 'r-1',
				number: 1,
				createdAt: '2026-02-10T12:00:00.000Z',
			}),
			buildSubmission({
				id: 'r-2',
				number: 2,
				createdAt: '2026-02-15T12:00:00.000Z',
			}),
		];

		renderWithProviders(
			<Harness responses={responses} initialDateFrom='2027-01-01' />,
		);

		expect(
			screen.getByText('Для данной формы нет откликов'),
		).toBeInTheDocument();
		expect(screen.queryByRole('list', { name: /Список откликов/ })).toBeNull();

		await userEvent.click(screen.getByRole('button', { name: /дата от/i }));
		await userEvent.click(
			await screen.findByRole('button', { name: /очистить/i }),
		);

		const list = screen.getByRole('list', { name: /Список откликов/ });
		expect(within(list).getAllByRole('link')).toHaveLength(2);
		expect(
			screen.queryByText('Для данной формы нет откликов'),
		).toBeNull();
	});

	it('смена сортировки на «Сначала старые» переставляет список по возрастанию даты', async () => {
		const responses: Submission[] = [
			buildSubmission({
				id: 'r-old',
				number: 1,
				createdAt: '2026-01-10T12:00:00.000Z',
			}),
			buildSubmission({
				id: 'r-new',
				number: 2,
				createdAt: '2026-03-10T12:00:00.000Z',
			}),
		];

		renderWithProviders(<Harness responses={responses} />);

		const firstHeadingDesc = screen.getAllByRole('heading', { level: 3 })[0];
		expect(firstHeadingDesc).toHaveTextContent('Отклик №2');

		await userEvent.click(
			screen.getByRole('combobox', { name: /сортировка/i }),
		);
		await userEvent.click(
			await screen.findByRole('option', { name: 'Сначала старые' }),
		);

		const firstHeadingAsc = screen.getAllByRole('heading', { level: 3 })[0];
		expect(firstHeadingAsc).toHaveTextContent('Отклик №1');
	});

	it('при 31 отклике изначально видно 30, после IO trigger — 31 и «Загружаем ещё…» исчезает', () => {
		const responses: Submission[] = Array.from({ length: 31 }, (_, index) =>
			buildSubmission({
				id: `r-${index + 1}`,
				number: index + 1,
				createdAt: `2026-05-${String(((index % 28) + 1)).padStart(2, '0')}T12:00:00.000Z`,
			}),
		);

		renderWithProviders(<Harness responses={responses} />);

		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(30);
		expect(screen.getByText('Загружаем ещё…')).toBeInTheDocument();

		act(() => {
			triggerLastObserver();
		});

		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(31);
		expect(screen.queryByText('Загружаем ещё…')).toBeNull();
	});
});
