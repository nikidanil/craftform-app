import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { formListSchema, formSchema, type Form } from '../model';
import { formKeys } from './keys';

export const useFormsList = () =>
	useQuery({
		queryKey: formKeys.list(),
		queryFn: async (): Promise<Form[]> => {
			const data = await http<unknown>('/api/forms');
			return formListSchema.parse(data);
		},
	});

export const useForm = (formId: string) =>
	useQuery({
		queryKey: formKeys.detail(formId),
		queryFn: async (): Promise<Form> => {
			const data = await http<unknown>(`/api/forms/${formId}`);
			return formSchema.parse(data);
		},
		enabled: Boolean(formId),
	});
