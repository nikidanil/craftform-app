import { buildPublicFormUrl } from './buildPublicFormUrl';

export const copyFormLink = async (
	formId: string | undefined,
): Promise<boolean> => {
	if (!formId) return false;
	try {
		await navigator.clipboard.writeText(buildPublicFormUrl(formId));
		return true;
	} catch {
		return false;
	}
};
