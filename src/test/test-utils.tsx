import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

export const makeTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});

type PathRef = { current: string };

type Options = Omit<RenderOptions, 'wrapper'> & {
	initialEntries?: string[];
	routePath?: string;
	queryClient?: QueryClient;
};

const LocationSpy = ({ pathRef }: { pathRef: PathRef }) => {
	const location = useLocation();
	pathRef.current = location.pathname + location.search;
	return null;
};

export const renderWithProviders = (
	ui: ReactElement,
	{
		initialEntries = ['/'],
		routePath,
		queryClient = makeTestQueryClient(),
		...rest
	}: Options = {},
) => {
	const pathRef: PathRef = { current: initialEntries[0] ?? '/' };

	const tree = routePath ? (
		<Routes>
			<Route path={routePath} element={ui} />
			<Route path='*' element={null} />
		</Routes>
	) : (
		ui
	);

	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={initialEntries}>
				{children}
				<LocationSpy pathRef={pathRef} />
			</MemoryRouter>
		</QueryClientProvider>
	);

	const result = render(tree, { wrapper, ...rest });

	return {
		...result,
		queryClient,
		getCurrentPath: () => pathRef.current,
	};
};
