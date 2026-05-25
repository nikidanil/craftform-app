import { Button } from '@/shared/ui';
import { useLogoutAction } from '../model';

type Props = {
	className?: string;
};

export const LogoutButton = ({ className }: Props) => {
	const logout = useLogoutAction();
	return (
		<Button
			type='button'
			variant='ghost'
			className={className}
			onClick={logout}
		>
			Выход
		</Button>
	);
};
