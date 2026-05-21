import { useSearchParams } from 'react-router';

export const useSyncedSearchParam = (
	name: string,
	defaultValue: string,
): [string, (next: string) => void] => {
	const [searchParams, setSearchParams] = useSearchParams();

	const value = searchParams.get(name) ?? defaultValue;

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
