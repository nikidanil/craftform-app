import { useEffect, useState } from 'react';

/**
 * Дебаунс значения: возвращает `value`, но обновляет его не чаще, чем раз в
 * `delayMs` миллисекунд после последнего изменения (таймер сбрасывается на
 * каждое новое значение и очищается при размонтировании).
 *
 * Зачем: гасит «дребезг» при быстром вводе (поиск форм) — фильтрация/запрос
 * срабатывают только когда пользователь сделал паузу.
 *
 * @param value — отслеживаемое значение (любого типа)
 * @param delayMs — задержка тишины перед обновлением, мс
 * @returns последнее «устоявшееся» значение
 * @example
 * const query = useDebouncedValue(searchInput, 300);
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebounced(value);
		}, delayMs);

		return () => {
			window.clearTimeout(timer);
		};
	}, [value, delayMs]);

	return debounced;
};
