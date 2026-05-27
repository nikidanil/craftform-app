import { buildPublicFormUrl } from '../lib/buildPublicFormUrl';

type CopyFormLink = {
	copy: (formId: string | undefined) => Promise<boolean>;
};

export const useCopyFormLink = (): CopyFormLink => {
	const copy = async (formId: string | undefined): Promise<boolean> => {
		if (!formId) return false;
		try {
			await navigator.clipboard.writeText(buildPublicFormUrl(formId));
			return true;
		} catch {
			return false;
		}
	};

	return { copy };
};
