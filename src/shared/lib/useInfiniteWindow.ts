import { useEffect, useRef, useState } from 'react';

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

	// sentinelRef — стабильный ref-callback (иначе observer пересоздаётся на
	// каждый рендер); reset уходит в useEffect-deps потребителя. Стабильность
	// ссылок обеспечивает React Compiler.
	const sentinelRef = (node: HTMLElement | null) => {
		setSentinelNode(node);
	};

	const reset = () => {
		setRawDisplayCount(pageSize);
	};

	return { displayCount, hasMore, sentinelRef, reset };
};
