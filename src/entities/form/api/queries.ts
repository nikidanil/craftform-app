import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { formListSchema, formSchema, type Form } from '../model';
import { formKeys } from './keys';

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

export const useForm = (formId: string) =>
	useQuery({
		queryKey: formKeys.detail(formId),
		queryFn: async (): Promise<Form> => {
			const data = await http<unknown>(`/api/forms/${formId}`);
			return formSchema.parse(data);
		},
		enabled: Boolean(formId),
	});
