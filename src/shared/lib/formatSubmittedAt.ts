const pad2 = (value: number): string => value.toString().padStart(2, '0');

export const formatSubmittedAt = (iso: string): string => {
	const date = new Date(iso);
	const day = pad2(date.getDate());
	const month = pad2(date.getMonth() + 1);
	const year = date.getFullYear();
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	return `${day}.${month}.${year}, ${hours}:${minutes}`;
};
