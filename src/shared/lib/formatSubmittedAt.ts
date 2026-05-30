const pad2 = (value: number): string => value.toString().padStart(2, '0');

/**
 * Форматирует ISO-метку времени отправки в строку `DD.MM.YYYY, HH:mm`.
 *
 * Время показывается в **локальной зоне зрителя**. Метки с суффиксом `Z`
 * или явным смещением конвертируются из UTC/offset в местное время; метки
 * без зоны трактуются как уже локальные.
 */
export const formatSubmittedAt = (iso: string): string => {
	const date = new Date(iso);
	const day = pad2(date.getDate());
	const month = pad2(date.getMonth() + 1);
	const year = date.getFullYear();
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	return `${day}.${month}.${year}, ${hours}:${minutes}`;
};
