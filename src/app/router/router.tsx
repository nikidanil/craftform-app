import { createBrowserRouter, type RouteObject } from 'react-router';
import { routePaths } from '@/shared/lib';
import { AppShell } from '../ui/AppShell';
import { FormsListPage } from '@/pages/forms-list';
import { ProfilePage } from '@/pages/profile';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { NewFormPage } from '@/pages/new-form';
import { FormBuilderPage } from '@/pages/form-builder';
import { FormFillPage } from '@/pages/form-fill';
import { ResponsesListPage } from '@/pages/responses-list';
import { ResponseViewPage } from '@/pages/response-view';
import { NotFoundPage } from '@/pages/not-found';
import { ProtectedRoute } from './ProtectedRoute';
import { UnauthorizedOnlyRoute } from './UnauthorizedOnlyRoute';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

export const appRoutes: RouteObject[] = [
	{
		element: <RootLayout />,
		errorElement: <RouteError />,
		children: [
			{
				element: <ProtectedRoute />,
				children: [
					{
						element: <AppShell />,
						children: [
							{ path: routePaths.home, element: <FormsListPage /> },
							{ path: routePaths.profile, element: <ProfilePage /> },
							{
								path: routePaths.formResponses,
								element: <ResponsesListPage />,
							},
							{
								path: routePaths.responseView,
								element: <ResponseViewPage />,
							},
						],
					},
					{
						element: <AppShell fullBleed />,
						children: [
							{ path: routePaths.formNew, element: <NewFormPage /> },
							{
								path: routePaths.formEdit,
								element: <FormBuilderPage />,
							},
						],
					},
				],
			},
			{
				element: <UnauthorizedOnlyRoute />,
				children: [
					{ path: routePaths.login, element: <LoginPage /> },
					{ path: routePaths.signup, element: <SignupPage /> },
				],
			},
			{ path: routePaths.formFill, element: <FormFillPage /> },
			{ path: '*', element: <NotFoundPage /> },
		],
	},
];

export const router = createBrowserRouter(appRoutes);
