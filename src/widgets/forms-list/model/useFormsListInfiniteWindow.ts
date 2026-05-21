import { useCallback, useEffect, useRef, useState } from 'react';

type InfiniteWindowResult = {
	displayCount: number;
	hasMore: boolean;
	sentinelRef: (node: HTMLElement | null) => void;
	reset: () => void;
};

export const useFormsListInfiniteWindow = (
	totalCount: number,
	pageSize = 30,
): InfiniteWindowResult => {
	const [rawDisplayCount, setRawDisplayCount] = useState(pageSize);
	const [sentinelNode, setSentinelNode] = useState<HTMLElement | null>(null);

	const totalCountRef = useRef(totalCount);
	useEffect(() => {
		totalCountRef.current = totalCount;
	}, [totalCount]);

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

	const sentinelRef = useCallback((node: HTMLElement | null) => {
		setSentinelNode(node);
	}, []);

	const reset = useCallback(() => {
		setRawDisplayCount(pageSize);
	}, [pageSize]);

	return { displayCount, hasMore, sentinelRef, reset };
};
