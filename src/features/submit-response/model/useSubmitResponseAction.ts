import { useCallback, useState } from 'react';
import { useSubmitResponse } from '@/entities/submission';
import { HttpError } from '@/shared/api';
import type { SubmissionInput } from '@/entities/submission';

export type SubmitStatus = 'idle' | 'pending' | 'success' | 'error';

const extractErrorMessage = (err: unknown): string => {
	if (err instanceof HttpError && err.body) {
		try {
			const parsed = JSON.parse(err.body) as Record<string, unknown>;
			const msg = parsed['message'] ?? parsed['error'];
			if (typeof msg === 'string' && msg.trim()) return msg;
		} catch {
			if (err.body.trim()) return err.body.trim();
		}
	}
	return 'Не удалось отправить отклик. Попробуйте ещё раз.';
};

export const useSubmitResponseAction = () => {
	const mutation = useSubmitResponse();
	const [status, setStatus] = useState<SubmitStatus>('idle');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = useCallback(
		(input: SubmissionInput) => {
			setStatus('pending');
			setErrorMessage(null);
			mutation.mutate(input, {
				onSuccess: () => setStatus('success'),
				onError: (err) => {
					setErrorMessage(extractErrorMessage(err));
					setStatus('error');
				},
			});
		},
		[mutation],
	);

	const reset = useCallback(() => {
		setStatus('idle');
		setErrorMessage(null);
	}, []);

	return { submit, status, errorMessage, reset };
};
