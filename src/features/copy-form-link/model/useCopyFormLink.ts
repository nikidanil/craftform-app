import { useCallback } from 'react';
import { buildPublicFormUrl } from '../lib/buildPublicFormUrl';

export const useCopyFormLink = () => {
	const copy = useCallback(async (formId: string | undefined) => {
		if (!formId) return;
		await navigator.clipboard.writeText(buildPublicFormUrl(formId));
	}, []);

	return { copy };
};
