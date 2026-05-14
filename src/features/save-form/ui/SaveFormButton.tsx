import { Button } from '@/shared/ui';

type Props = {
	disabled?: boolean;
	pending?: boolean;
};

export const SaveFormButton = ({ disabled, pending }: Props) => (
	<Button type='submit' disabled={disabled || pending}>
		{pending ? 'Сохранение…' : 'Сохранить'}
	</Button>
);
