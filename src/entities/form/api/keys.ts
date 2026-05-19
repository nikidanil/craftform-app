export const formKeys = {
	all: ['forms'] as const,
	list: () => [...formKeys.all, 'list'] as const,
	detail: (formId: string) => [...formKeys.all, 'detail', formId] as const,
};
