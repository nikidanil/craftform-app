import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export const useSyncedSearchParam = (
	name: string,
	defaultValue: string,
): [string, (next: string) => void] => {
	const [searchParams, setSearchParams] = useSearchParams();

	const value = searchParams.get(name) ?? defaultValue;

	// setValue обёрнут в useCallback, чтобы не пересоздаваться на рендерах, не
	// меняющих search: иначе useEffect-самоочистка sort у потребителей
	// (ResponsesListPage, FormsListPage) перезапускалась бы каждый рендер.
	// При смене самого search setSearchParams (а с ним и setValue) меняется —
	// но тогда меняется и сам параметр, так что повторный прогон эффекта безвреден.
	const setValue = useCallback(
		(next: string) => {
			setSearchParams(
				(previous) => {
					const updated = new URLSearchParams(previous);
					if (next === defaultValue) {
						updated.delete(name);
					} else {
						updated.set(name, next);
					}
					return updated;
				},
				{ replace: true },
			);
		},
		[name, defaultValue, setSearchParams],
	);

	return [value, setValue];
};
