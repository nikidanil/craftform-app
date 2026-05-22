import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export const useSyncedSearchParam = (
	name: string,
	defaultValue: string,
): [string, (next: string) => void] => {
	const [searchParams, setSearchParams] = useSearchParams();

	const value = searchParams.get(name) ?? defaultValue;

	// setValue стабилен по ссылке — иначе useEffect'ы зависящие от него
	// перезапускаются на каждом рендере страницы (см. ResponsesListPage самочистку sort)
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
