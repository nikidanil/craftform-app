import { Outlet } from 'react-router';
import { ScrollToTop } from './ScrollToTop';

export const RootLayout = () => (
	<>
		<ScrollToTop />
		<Outlet />
	</>
);
