import { useLogoutAction } from '../model';

type Props = {
	className?: string;
};

export const LogoutButton = ({ className }: Props) => {
	const logout = useLogoutAction();
	return (
		<button type='button' className={className} onClick={logout}>
			Выход
		</button>
	);
};
