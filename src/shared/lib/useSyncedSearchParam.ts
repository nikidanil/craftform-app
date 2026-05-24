import { useSearchParams } from 'react-router';

export const useSyncedSearchParam = (
	name: string,
	defaultValue: string,
): [string, (next: string) => void] => {
	const [searchParams, setSearchParams] = useSearchParams();

	const value = searchParams.get(name) ?? defaultValue;

	// setValue должен быть стабилен по ссылке — иначе useEffect'ы, зависящие от
	// него, перезапускаются на каждом рендере (см. ResponsesListPage, самочистка
	// sort). Стабильность ссылки обеспечивает React Compiler.
	const setValue = (next: string) => {
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
	};

	return [value, setValue];
};
