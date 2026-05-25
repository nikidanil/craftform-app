import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastViewport } from '@/shared/ui';
import { queryClient } from './queryClient';

type Props = {
	children: ReactNode;
};

export const AppProviders = ({ children }: Props) => (
	<QueryClientProvider client={queryClient}>
		{children}
		<ToastViewport />
	</QueryClientProvider>
);
