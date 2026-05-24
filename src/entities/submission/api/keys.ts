export const submissionKeys = {
	all: ['submissions'] as const,
	list: (formId: string) => [...submissionKeys.all, 'list', formId] as const,
	detail: (responseId: string) =>
		[...submissionKeys.all, 'detail', responseId] as const,
	countByForm: ['submissions', 'count-by-form'] as const,
};
