import { createBrowserRouter, type RouteObject } from 'react-router';
import { routePaths } from '@/shared/lib';
import { AppShell } from '@/widgets/app-shell';
import { FormsListPage } from '@/pages/forms-list';
import { ProfilePage } from '@/pages/profile';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { NewFormPage } from '@/pages/new-form';
import { FormBuilderPage } from '@/pages/form-builder';
import { FormFillPage } from '@/pages/form-fill';
import { ResponsesListPage } from '@/pages/responses-list';
import { ResponseViewPage } from '@/pages/response-view';
import { ProtectedRoute } from './ProtectedRoute';
import { UnauthorizedOnlyRoute } from './UnauthorizedOnlyRoute';

export const appRoutes: RouteObject[] = [
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppShell />,
				children: [
					{ path: routePaths.home, element: <FormsListPage /> },
					{ path: routePaths.profile, element: <ProfilePage /> },
					{ path: routePaths.formNew, element: <NewFormPage /> },
					{ path: routePaths.formEdit, element: <FormBuilderPage /> },
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
];

export const router = createBrowserRouter(appRoutes);
