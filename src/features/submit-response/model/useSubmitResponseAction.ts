import { useState } from 'react';
import { z } from 'zod';
import { useSubmitResponse } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import type { SubmissionInput } from '@/entities/submission';

export type SubmitStatus = 'idle' | 'pending' | 'success' | 'error';

const errorBodySchema = z.object({
	message: z.string().optional(),
	error: z.string().optional(),
});

const extractErrorMessage = (error: unknown): string => {
	if (error instanceof HttpError && error.body) {
		try {
			const parsed = errorBodySchema.safeParse(JSON.parse(error.body));
			const message = parsed.success
				? (parsed.data.message ?? parsed.data.error)
				: undefined;
			if (message && message.trim()) return message;
		} catch {
			if (error.body.trim()) return error.body.trim();
		}
	}
	return 'Не удалось отправить отклик. Попробуйте ещё раз.';
};

/**
 * Действие отправки отклика респондентом на публичной странице формы.
 *
 * Зачем: ошибку извлекает `extractErrorMessage` — пытается достать `message`/`error`
 * из тела `HttpError` (JSON), иначе показывает общий текст; так пользователь видит
 * осмысленную причину отказа. Асинхронность скрыта: `submit` ничего не возвращает,
 * результат отражается в `status`/`errorMessage`.
 *
 * @returns `{ submit, status, errorMessage, reset }`; `submit(input)` → `void`
 *   (`status`: idle | pending | success | error)
 * @example
 * const { submit, status, errorMessage } = useSubmitResponseAction();
 * submit({ formId, answers });
 */
export const useSubmitResponseAction = () => {
	const mutation = useSubmitResponse();
	const [status, setStatus] = useState<SubmitStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = (input: SubmissionInput) => {
		setStatus('pending');
		setErrorMessage(null);
		mutation.mutate(input, {
			onSuccess: () => setStatus('success'),
			onError: (error) => {
				setErrorMessage(extractErrorMessage(error));
				setStatus('error');
			},
		});
	};

	const reset = () => {
		setStatus('idle');
		setErrorMessage(null);
	};

	return { submit, status, errorMessage, reset };
};
