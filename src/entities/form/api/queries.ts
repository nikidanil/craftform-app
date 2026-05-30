import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { formListSchema, formSchema, type Form } from '../model';
import { formKeys } from './keys';

/**
 * Список форм автора (React Query). Запрос валидируется Zod-схемой
 * (`formListSchema`) и не запускается, пока `authorId` пуст (`enabled`).
 *
 * Зачем: `data` всегда массив (`query.data ?? []`) — потребителям (список форм)
 * не нужно проверять `undefined` на первом рендере. NB: это упрощает UI ценой
 * того, что loading-состояние неотличимо от «пустой список» по `data`
 * (ориентируйтесь на `isLoading`).
 *
 * @param authorId — id автора; при `undefined` запрос не выполняется
 * @returns результат useQuery, где `data: Form[]` (никогда не `undefined`)
 * @example
 * const { data: forms, isLoading } = useFormsByAuthor(currentUser?.id);
 */
export const useFormsByAuthor = (authorId: string | undefined) => {
	const query = useQuery({
		queryKey: formKeys.listByAuthor(authorId ?? ''),
		queryFn: async (): Promise<Form[]> => {
			const data = await http<unknown>(
				`/api/forms?authorId=${encodeURIComponent(authorId ?? '')}`,
			);
			return formListSchema.parse(data);
		},
		enabled: Boolean(authorId),
	});
	return { ...query, data: query.data ?? [] };
};

/**
 * Одна форма по id (React Query). Ответ валидируется `formSchema`; запрос не
 * стартует при пустом `formId` (`enabled`).
 *
 * @param formId — id формы
 * @returns результат useQuery с `data: Form | undefined`
 */
export const useForm = (formId: string) =>
	useQuery({
		queryKey: formKeys.detail(formId),
		queryFn: async (): Promise<Form> => {
			const data = await http<unknown>(`/api/forms/${formId}`);
			return formSchema.parse(data);
		},
		enabled: Boolean(formId),
	});
