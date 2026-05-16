const monthsGenitive = [
	'января',
	'февраля',
	'марта',
	'апреля',
	'мая',
	'июня',
	'июля',
	'августа',
	'сентября',
	'октября',
	'ноября',
	'декабря',
];

const isSameLocalDay = (left: Date, right: Date): boolean =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate();

export const formatCreatedAt = (iso: string, now: Date = new Date()): string => {
	const date = new Date(iso);

	if (isSameLocalDay(date, now)) {
		return 'Создана сегодня';
	}

	const day = date.getDate();
	const month = monthsGenitive[date.getMonth()];
	const year = date.getFullYear();
	return `Создана ${day} ${month} ${year}`;
};
