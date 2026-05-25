import { toast } from '@/shared/ui';
import { buildPublicFormUrl } from '../lib/buildPublicFormUrl';

type CopyFormLink = {
	copy: (formId: string | undefined) => Promise<void>;
};

export const useCopyFormLink = (): CopyFormLink => {
	const copy = async (formId: string | undefined) => {
		if (!formId) return;
		try {
			await navigator.clipboard.writeText(buildPublicFormUrl(formId));
			toast.success('Ссылка скопирована');
		} catch {
			toast.error('Не удалось скопировать ссылку');
		}
	};

	return { copy };
};
