import { useEffect } from 'react';
import { Link } from 'react-router';
import { MessageSquare } from 'lucide-react';

import type { Submission } from '@/entities/submission';
import { responsesCountLabel, useInfiniteWindow } from '@/shared/lib';

import {
	applyResponsesListFilters,
	DEFAULT_SORT,
	type SortOption,
} from '../model';

import { EmptyState } from './EmptyState';
import { ResponseListItem } from './ResponseListItem';
import { ResponsesListToolbar } from './ResponsesListToolbar';
import styles from './ResponsesList.module.css';

type Props = {
	formTitle: string;
	responses: Submission[];
	sort: SortOption;
	onSortChange: (next: SortOption) => void;
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (next: string) => void;
	onDateToChange: (next: string) => void;
};

export const ResponsesList = ({
	formTitle,
	responses,
	sort,
	onSortChange,
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
}: Props) => {
	const filtered = applyResponsesListFilters(responses, {
		sort,
		dateFrom,
		dateTo,
	});
	const { displayCount, hasMore, sentinelRef, reset } = useInfiniteWindow(
		filtered.length,
	);

	useEffect(() => {
		reset();
	}, [sort, dateFrom, dateTo, reset]);

	const isDefaultView =
		sort === DEFAULT_SORT && dateFrom === '' && dateTo === '';
	const hasResponses = responses.length > 0;
	// Анонс только когда тулбар виден — иначе пользователь услышит «Отклики не найдены»
	// и не сможет сбросить фильтр, потому что тулбар скрыт при responses.length === 0
	const announcement =
		isDefaultView || !hasResponses
			? ''
			: filtered.length === 0
				? 'Отклики не найдены'
				: `Найдено откликов: ${filtered.length}`;

	return (
		<section className={styles.page}>
			<nav className={styles.breadcrumb} aria-label='Хлебные крошки'>
				<Link to='/'>Главная</Link>
				<span className={styles.breadcrumbSep} aria-hidden>
					›
				</span>
				<span aria-current='page'>Отклики</span>
			</nav>

			<header className={styles.heading}>
				<div className={styles.headingLeft}>
					<p className={styles.formCaption}>
						Форма: <span>{formTitle}</span>
					</p>
					<h1 className={styles.title}>Отклики</h1>
				</div>
				<span className={styles.badge}>
					<MessageSquare size={13} strokeWidth={2.5} aria-hidden />
					{responsesCountLabel(responses.length)}
				</span>
			</header>

			{hasResponses && (
				<ResponsesListToolbar
					sort={sort}
					onSortChange={onSortChange}
					dateFrom={dateFrom}
					onDateFromChange={onDateFromChange}
					dateTo={dateTo}
					onDateToChange={onDateToChange}
				/>
			)}

			<span
				aria-live='polite'
				aria-atomic='true'
				className={styles.srOnly}
			>
				{announcement}
			</span>

			{/* docs/features/responses.md: оба пустых состояния используют один и тот же текст «Для данной формы нет откликов» — потому EmptyState один на обе ветки */}
			{filtered.length === 0 ? (
				<EmptyState />
			) : (
				<>
					<ul className={styles.list} aria-label='Список откликов'>
						{filtered.slice(0, displayCount).map((submission) => (
							<li key={submission.id}>
								<ResponseListItem submission={submission} />
							</li>
						))}
					</ul>
					{hasMore && (
						<>
							<p className={styles.loading}>Загружаем ещё…</p>
							<div
								ref={sentinelRef}
								className={styles.sentinel}
								aria-hidden
							/>
						</>
					)}
				</>
			)}
		</section>
	);
};
