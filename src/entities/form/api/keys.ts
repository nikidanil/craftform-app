export const formKeys = {
	all: ['forms'] as const,
	lists: () => [...formKeys.all, 'list'] as const,
	listByAuthor: (authorId: string) =>
		[...formKeys.lists(), 'author', authorId] as const,
	detail: (formId: string) => [...formKeys.all, 'detail', formId] as const,
};
