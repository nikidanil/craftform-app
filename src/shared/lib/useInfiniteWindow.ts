import { useCallback, useEffect, useRef, useState } from 'react';

type InfiniteWindowResult = {
	displayCount: number;
	hasMore: boolean;
	sentinelRef: (node: HTMLElement | null) => void;
	reset: () => void;
};

/**
 * Прогрессивный показ длинного списка: держит «окно» из первых N элементов и
 * расширяет его на `pageSize`, когда пользователь докручивает до элемента-
 * сентинела (через IntersectionObserver). Список не виртуализирует — только
 * ограничивает, сколько элементов рендерить.
 *
 * Зачем: `rawDisplayCount` намеренно НЕ сжимается при сужении набора (фильтр) —
 * иначе при возврате к большому набору пришлось бы доскролливать заново.
 * `sentinelRef`/`reset` стабилизированы через useCallback, т.к. уходят в
 * ref-callback и useEffect-deps потребителя.
 *
 * @param totalCount — полное число элементов в наборе (после фильтрации)
 * @param pageSize — сколько добавлять за один шаг (по умолчанию 30)
 * @returns `{ displayCount, hasMore, sentinelRef, reset }` — сколько показывать,
 *   есть ли ещё, ref на сентинел, сброс окна к первой странице
 * @example
 * const { displayCount, hasMore, sentinelRef } = useInfiniteWindow(forms.length);
 * return (
 *   <>
 *     {forms.slice(0, displayCount).map(renderCard)}
 *     {hasMore && <div ref={sentinelRef} />}
 *   </>
 * );
 */
export const useInfiniteWindow = (
	totalCount: number,
	pageSize = 30,
): InfiniteWindowResult => {
	const [rawDisplayCount, setRawDisplayCount] = useState(pageSize);
	const [sentinelNode, setSentinelNode] = useState<HTMLElement | null>(null);

	const totalCountRef = useRef(totalCount);
	useEffect(() => {
		totalCountRef.current = totalCount;
	}, [totalCount]);

	// rawDisplayCount не сжимаем при сужении фильтра — иначе на возврате к большому набору пришлось бы листать заново
	const displayCount = Math.min(rawDisplayCount, totalCount);
	const hasMore = displayCount < totalCount;

	useEffect(() => {
		if (!sentinelNode || !hasMore) {
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				setRawDisplayCount((current) =>
					Math.min(current + pageSize, totalCountRef.current),
				);
			}
		});
		observer.observe(sentinelNode);

		return () => {
			observer.disconnect();
		};
	}, [sentinelNode, hasMore, pageSize]);

	// sentinelRef и reset намеренно обёрнуты в useCallback: sentinelRef — это
	// ref-callback (без стабильности observer пересоздаётся на каждый рендер),
	// reset уходит в useEffect-deps потребителя (самоочистка при смене фильтра).
	// deps sentinelRef пусты — setSentinelNode стабилен как диспатч useState.
	const sentinelRef = useCallback((node: HTMLElement | null) => {
		setSentinelNode(node);
	}, []);

	const reset = useCallback(() => {
		setRawDisplayCount(pageSize);
	}, [pageSize]);

	return { displayCount, hasMore, sentinelRef, reset };
};
