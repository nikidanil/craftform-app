import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastViewport } from '@/shared/ui';
import { queryClient } from './queryClient';
import { BackgroundBlobs } from '../ui/BackgroundBlobs';

type Props = {
	children: ReactNode;
};

export const AppProviders = ({ children }: Props) => (
	<QueryClientProvider client={queryClient}>
		<BackgroundBlobs />
		{children}
		<ToastViewport />
	</QueryClientProvider>
);
