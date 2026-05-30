import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Двусторонняя синхронизация одного query-параметра URL с состоянием: читает
 * текущее значение (или `defaultValue`, если параметра нет) и даёт сеттер,
 * который пишет его в URL через `replace` (без новой записи в истории).
 *
 * Зачем: при установке значения по умолчанию параметр УДАЛЯЕТСЯ из URL — чтобы
 * не плодить `?sort=created-desc` для дефолта. `setValue` обёрнут в useCallback,
 * чтобы не пересоздаваться на рендерах без смены search (иначе useEffect'ы
 * потребителя, держащие его в deps, перезапускались бы каждый рендер).
 *
 * @param name — имя query-параметра (например `'sort'`)
 * @param defaultValue — значение, при котором параметр убирается из URL
 * @returns кортеж `[value, setValue]` — как у useState
 * @example
 * const [sort, setSort] = useSyncedSearchParam('sort', 'created-desc');
 */
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
