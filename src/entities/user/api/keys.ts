export const userKeys = {
	all: ['users'] as const,
	byEmail: (email: string) => [...userKeys.all, 'byEmail', email] as const,
};
