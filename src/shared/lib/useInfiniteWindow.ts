import { useCallback, useEffect, useRef, useState } from 'react';

type InfiniteWindowResult = {
	displayCount: number;
	hasMore: boolean;
	sentinelRef: (node: HTMLElement | null) => void;
	reset: () => void;
};

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
