import { buildPublicFormUrl } from '../lib/buildPublicFormUrl';

export const useCopyFormLink = () => {
	const copy = async (formId: string | undefined) => {
		if (!formId) return;
		await navigator.clipboard.writeText(buildPublicFormUrl(formId));
	};

	return { copy };
};
