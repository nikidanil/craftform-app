import { Outlet } from 'react-router';
import { BackgroundBlobs } from '../../ui/BackgroundBlobs';
import { ScrollToTop } from '../lib/ScrollToTop';

export const RootLayout = () => (
	<>
		<BackgroundBlobs />
		<ScrollToTop />
		<Outlet />
	</>
);
