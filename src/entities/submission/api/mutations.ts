import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import {
	submissionSchema,
	type Submission,
	type SubmissionInput,
} from '../model';
import { submissionKeys } from './keys';

type ExistingSubmission = { id: string };

export const useSubmitResponse = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SubmissionInput): Promise<Submission> => {
			const existing = await http<ExistingSubmission[]>(
				`/api/responses?formId=${encodeURIComponent(input.formId)}`,
			);
			const payload: Submission = {
				...input,
				id: crypto.randomUUID(),
				number: existing.length + 1,
				createdAt: new Date().toISOString(),
			};
			const data = await http<unknown>('/api/responses', {
				method: 'POST',
				body: payload,
			});
			return submissionSchema.parse(data);
		},
		onSuccess: (_data, { formId }) => {
			queryClient.invalidateQueries({ queryKey: submissionKeys.list(formId) });
		},
	});
};
