import { Outlet } from 'react-router';
import { ScrollToTop } from './ScrollToTop';
import { BackgroundBlobs } from '../ui/BackgroundBlobs';

export const RootLayout = () => (
	<>
		<BackgroundBlobs />
		<ScrollToTop />
		<Outlet />
	</>
);
