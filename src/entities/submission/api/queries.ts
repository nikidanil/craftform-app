import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import {
	aggregateResponsesByForm,
	submissionListSchema,
	submissionSchema,
	type Submission,
} from '../model';
import { submissionKeys } from './keys';

export const useResponsesList = (formId: string) =>
	useQuery({
		queryKey: submissionKeys.list(formId),
		queryFn: async (): Promise<Submission[]> => {
			const data = await http<unknown>(
				`/api/responses?formId=${encodeURIComponent(formId)}`,
			);
			return submissionListSchema.parse(data);
		},
		enabled: Boolean(formId),
	});

export const useResponse = (responseId: string) =>
	useQuery({
		queryKey: submissionKeys.detail(responseId),
		queryFn: async (): Promise<Submission> => {
			const data = await http<unknown>(`/api/responses/${responseId}`);
			return submissionSchema.parse(data);
		},
		enabled: Boolean(responseId),
	});

export const useResponsesCountByForm = () =>
	useQuery({
		queryKey: submissionKeys.countByForm,
		queryFn: async (): Promise<Submission[]> => {
			const data = await http<unknown>('/api/responses');
			return submissionListSchema.parse(data);
		},
		select: aggregateResponsesByForm,
	});
