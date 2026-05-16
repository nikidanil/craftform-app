const pluralRules = new Intl.PluralRules('ru-RU');

const forms = {
	one: 'отклик',
	few: 'отклика',
	many: 'откликов',
} as const;

export const responsesCountLabel = (count: number): string => {
	const category = pluralRules.select(count) as keyof typeof forms;
	const word = forms[category] ?? forms.many;
	return `${count} ${word}`;
};
