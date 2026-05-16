const pluralRules = new Intl.PluralRules('ru-RU');

const forms = {
	one: 'отклик',
	few: 'отклика',
	many: 'откликов',
} as const;

const isKnownPluralForm = (key: string): key is keyof typeof forms =>
	key in forms;

export const responsesCountLabel = (count: number): string => {
	const category = pluralRules.select(count);
	const word = isKnownPluralForm(category) ? forms[category] : forms.many;
	return `${count} ${word}`;
};
