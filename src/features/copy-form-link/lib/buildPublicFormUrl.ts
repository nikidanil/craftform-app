import { routes } from '@/shared/lib';

export const buildPublicFormUrl = (formId: string): string =>
	`${window.location.origin}${routes.formFill(formId)}`;
