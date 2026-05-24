import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppShell />,
				children: [
					{ path: '/', element: <FormsListPage /> },
					{ path: '/me', element: <ProfilePage /> },
					{ path: '/forms/new', element: <NewFormPage /> },
					{ path: '/forms/:formId/edit', element: <FormBuilderPage /> },
					{
						path: '/forms/:formId/responses',
						element: <ResponsesListPage />,
					},
					{
						path: '/forms/:formId/responses/:responseId',
						element: <ResponseViewPage />,
					},
				],
			},
		],
	},
	{
		element: <UnauthorizedOnlyRoute />,
		children: [
			{ path: '/login', element: <LoginPage /> },
			{ path: '/signup', element: <SignupPage /> },
		],
	},
	{ path: '/forms/:formId', element: <FormFillPage /> },
]);
