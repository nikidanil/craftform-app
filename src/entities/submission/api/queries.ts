import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import {
	aggregateResponsesByForm,
	submissionListSchema,
	submissionSchema,
	type Submission,
} from '../model';
import { submissionKeys } from './keys';

/**
 * Все отклики (submissions) на одну форму (React Query). Ответ валидируется
 * `submissionListSchema`; запрос не стартует при пустом `formId` (`enabled`).
 *
 * @param formId — id формы
 * @returns результат useQuery с `data: Submission[] | undefined`
 */
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

/**
 * Один отклик по id (React Query). Ответ валидируется `submissionSchema`;
 * запрос не стартует при пустом `responseId` (`enabled`).
 *
 * @param responseId — id отклика
 * @returns результат useQuery с `data: Submission | undefined`
 */
export const useResponse = (responseId: string) =>
	useQuery({
		queryKey: submissionKeys.detail(responseId),
		queryFn: async (): Promise<Submission> => {
			const data = await http<unknown>(`/api/responses/${responseId}`);
			return submissionSchema.parse(data);
		},
		enabled: Boolean(responseId),
	});

/**
 * Число откликов по каждой форме — для счётчиков в списке форм (React Query).
 *
 * Зачем: грузит ВСЕ отклики (`/api/responses`) и агрегирует на клиенте через
 * `select: aggregateResponsesByForm` в `Record<formId, count>`. На мок-API это
 * приемлемо; с реальным бэком стоило бы заменить на серверный агрегат (известный
 * техдолг масштабирования). `select` пересчитывает результат, не перезапрашивая.
 *
 * @returns результат useQuery с `data: Record<string, number> | undefined`
 *   (ключ — id формы, значение — число откликов)
 * @example
 * const { data: counts } = useResponsesCountByForm();
 * const count = counts?.[form.id] ?? 0;
 */
export const useResponsesCountByForm = () =>
	useQuery({
		queryKey: submissionKeys.countByForm,
		queryFn: async (): Promise<Submission[]> => {
			const data = await http<unknown>('/api/responses');
			return submissionListSchema.parse(data);
		},
		select: aggregateResponsesByForm,
	});
