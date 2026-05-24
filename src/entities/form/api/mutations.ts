import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { submissionKeys } from '@/entities/submission';
import {
	formSchema,
	type Form,
	type FormInput,
} from '../model';
import { formKeys } from './keys';

type ResponseRef = { id: string };

export type CreateFormVars = {
	input: FormInput;
	authorId: string;
};

export const useCreateForm = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ input, authorId }: CreateFormVars): Promise<Form> => {
			const payload: Form = {
				...input,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				authorId,
			};
			const data = await http<unknown>('/api/forms', {
				method: 'POST',
				body: payload,
			});
			return formSchema.parse(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: formKeys.lists() });
		},
	});
};

type UpdateFormVars = {
	formId: string;
	patch: Partial<FormInput>;
};

export const useUpdateForm = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ formId, patch }: UpdateFormVars): Promise<Form> => {
			const data = await http<unknown>(`/api/forms/${formId}`, {
				method: 'PATCH',
				body: patch,
			});
			return formSchema.parse(data);
		},
		onSuccess: (_data, { formId }) => {
			queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) });
			queryClient.invalidateQueries({ queryKey: formKeys.lists() });
		},
	});
};

export const useDeleteForm = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (formId: string): Promise<void> => {
			const responses = await http<ResponseRef[]>(
				`/api/responses?formId=${encodeURIComponent(formId)}`,
			);
			await Promise.all(
				responses.map((response) =>
					http<unknown>(`/api/responses/${response.id}`, { method: 'DELETE' }),
				),
			);
			await http<unknown>(`/api/forms/${formId}`, { method: 'DELETE' });
		},
		onSuccess: (_data, formId) => {
			queryClient.invalidateQueries({ queryKey: formKeys.lists() });
			queryClient.removeQueries({ queryKey: formKeys.detail(formId) });
			queryClient.invalidateQueries({ queryKey: submissionKeys.all });
		},
	});
};
