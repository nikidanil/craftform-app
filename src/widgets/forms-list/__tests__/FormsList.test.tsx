import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/test-utils';
import {
	stubIntersectionObserver,
	triggerLastObserver,
	unstubIntersectionObserver,
} from '@/test/mockIntersectionObserver';
import type { Form } from '@/entities/form';

import { FormsList } from '../ui/FormsList';
import type { SortOption } from '../model';

const buildForm = (
	id: string,
	title: string,
	createdAt = '2026-04-15T10:00:00.000Z',
): Form => ({
	id,
	title,
	description: '',
	questions: [],
	createdAt,
	authorId: 'author-1',
});

type HarnessProps = {
	forms: Form[];
	responsesCountByForm?: Record<string, number>;
	initialSearch?: string;
	initialSort?: SortOption;
};

const Harness = ({
	forms,
	responsesCountByForm = {},
	initialSearch = '',
	initialSort = 'created-desc',
}: HarnessProps) => {
	const [search, setSearch] = useState(initialSearch);
	const [sort, setSort] = useState<SortOption>(initialSort);

	return (
		<FormsList
			forms={forms}
			responsesCountByForm={responsesCountByForm}
			search={search}
			onSearchChange={setSearch}
			sort={sort}
			onSortChange={setSort}
			searchDebounceMs={0}
		/>
	);
};

describe('FormsList', () => {
	beforeEach(() => {
		stubIntersectionObserver();
	});

	afterEach(() => {
		unstubIntersectionObserver();
	});

	it('пустой список форм → видно сообщение и клик по CTA ведёт на /forms/new', async () => {
		const { getCurrentPath } = renderWithProviders(
			<Harness forms={[]} />,
		);

		expect(
			screen.getByText('У вас пока нет форм. Создайте первую'),
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: 'Создать форму' }));
		expect(getCurrentPath()).toBe('/forms/new');
	});

	it('две формы → видны обе карточки со счётчиками, клик по «Создать новую форму» ведёт на /forms/new', async () => {
		const forms = [
			buildForm('form-1', 'Опрос A'),
			buildForm('form-2', 'Опрос B'),
		];

		const { getCurrentPath } = renderWithProviders(
			<Harness
				forms={forms}
				responsesCountByForm={{ 'form-1': 2, 'form-2': 0 }}
			/>,
		);

		expect(
			screen.getByRole('heading', { name: 'Опрос A' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: 'Опрос B' }),
		).toBeInTheDocument();
		expect(screen.getByText('2 отклика')).toBeInTheDocument();
		expect(screen.getByText('0 откликов')).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('link', { name: /Создать новую форму/ }),
		);
		expect(getCurrentPath()).toBe('/forms/new');
	});

	it('ввод текста, не совпадающего с названиями, → виден NotFoundState, грид скрыт', async () => {
		const forms = [
			buildForm('form-1', 'Опрос про офис'),
			buildForm('form-2', 'Регистрация на митап'),
		];

		renderWithProviders(<Harness forms={forms} />);

		await userEvent.type(
			screen.getByRole('searchbox', { name: /поиск форм/i }),
			'ничегонесовпадает',
		);

		expect(
			await screen.findByText('Формы с данным названием не найдены'),
		).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Опрос про офис' })).toBeNull();
		expect(screen.queryByRole('heading', { name: 'Регистрация на митап' })).toBeNull();
	});

	it('при 32 формах изначально видно 30, после прокрутки до конца — 32 и «Загружаем ещё…» исчезает', () => {
		const forms = Array.from({ length: 32 }, (_, index) =>
			buildForm(
				`form-${index + 1}`,
				`Форма ${String(index + 1).padStart(2, '0')}`,
				`2026-${String(((index % 12) + 1)).padStart(2, '0')}-01T10:00:00.000Z`,
			),
		);

		renderWithProviders(<Harness forms={forms} />);

		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(30);

		act(() => {
			triggerLastObserver();
		});

		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(32);
		expect(screen.queryByText('Загружаем ещё…')).toBeNull();
	});

	it('смена сортировки на «По названию: А–Я» переставляет карточки в алфавитном порядке', async () => {
		const forms = [
			buildForm('form-1', 'Бронь', '2026-03-01T10:00:00.000Z'),
			buildForm('form-2', 'Анкета', '2026-02-01T10:00:00.000Z'),
			buildForm('form-3', 'Викторина', '2026-01-01T10:00:00.000Z'),
		];

		renderWithProviders(<Harness forms={forms} />);

		expect(
			screen.getAllByRole('heading', { level: 2 })[0],
		).toHaveTextContent('Бронь');

		await userEvent.click(
			screen.getByRole('combobox', { name: /сортировка/i }),
		);
		await userEvent.click(
			await screen.findByRole('option', { name: 'По названию: А–Я' }),
		);

		const headings = screen.getAllByRole('heading', { level: 2 });
		expect(headings[0]).toHaveTextContent('Анкета');
		expect(headings[1]).toHaveTextContent('Бронь');
		expect(headings[2]).toHaveTextContent('Викторина');
	});
});
