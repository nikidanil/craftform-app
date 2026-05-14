import { Button } from '@/shared/ui';
import { useCopyFormLink } from '../model/useCopyFormLink';

type Props = {
	formId: string | undefined;
};

export const CopyFormLinkButton = ({ formId }: Props) => {
	const { copy } = useCopyFormLink();
	const disabled = !formId;

	return (
		<Button
			type='button'
			variant='outline'
			disabled={disabled}
			onClick={() => copy(formId)}
		>
			Скопировать ссылку
		</Button>
	);
};
