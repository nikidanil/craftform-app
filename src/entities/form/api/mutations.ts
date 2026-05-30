import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import {
	formSchema,
	type Form,
	type FormInput,
} from '../model';
import { formKeys } from './keys';

type ResponseRef = { id: string };

type CreateFormVars = {
	input: FormInput;
	authorId: string;
};

/**
 * Создание формы (React Query mutation). `id` и `createdAt` генерируются на
 * клиенте, отправляется готовый объект `Form`; ответ валидируется `formSchema`.
 *
 * Зачем: на успех инвалидирует `formKeys.lists()` — все списки форм обновятся.
 *
 * @returns мутация с переменными `{ input: FormInput; authorId: string }`,
 *   результат — созданная `Form`
 * @example
 * const create = useCreateForm();
 * const form = await create.mutateAsync({ input, authorId: user.id });
 */
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

/**
 * Частичное обновление формы (React Query mutation, PATCH). Ответ валидируется
 * `formSchema`.
 *
 * Зачем: на успех инвалидирует и деталь (`formKeys.detail(formId)`), и списки
 * (`formKeys.lists()`) — карточка и перечень не разойдутся.
 *
 * @returns мутация с переменными `{ formId: string; patch: Partial<FormInput> }`,
 *   результат — обновлённая `Form`
 */
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

type DeleteFormOptions = {
	onSuccess?: (formId: string) => void;
};

/**
 * Удаление формы вместе со всеми её ответами (React Query mutation).
 *
 * Зачем: каскадное удаление — сначала GET всех ответов формы и DELETE каждого,
 * затем DELETE самой формы (мок-API не делает каскад сам). На успех invalidate
 * списков + `removeQueries` на деталь формы (не invalidate — данные больше не нужны).
 * Опциональный `onSuccess(formId)` поднимает побочные эффекты в потребителя
 * (например, инвалидацию счётчиков откликов), не завязывая entities на submission.
 *
 * @param options — `{ onSuccess?(formId) }`, вызывается после успешного удаления
 * @returns мутация с переменной `formId: string`, результат — `void`
 * @example
 * const remove = useDeleteForm({
 *   onSuccess: () => queryClient.invalidateQueries({ queryKey: submissionKeys.all }),
 * });
 */
export const useDeleteForm = (options?: DeleteFormOptions) => {
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
			options?.onSuccess?.(formId);
		},
	});
};
