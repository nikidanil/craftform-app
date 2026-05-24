// Шаблоны путей с :param-сегментами — для конфигурации роутера (createBrowserRouter).
export const routePaths = {
	home: '/',
	login: '/login',
	signup: '/signup',
	profile: '/me',
	formNew: '/forms/new',
	formEdit: '/forms/:formId/edit',
	formFill: '/forms/:formId',
	formResponses: '/forms/:formId/responses',
	responseView: '/forms/:formId/responses/:responseId',
} as const;

// Готовые URL для navigate/Link — параметры кодируются.
export const routes = {
	home: routePaths.home,
	login: routePaths.login,
	signup: routePaths.signup,
	profile: routePaths.profile,
	formNew: routePaths.formNew,
	formEdit: (formId: string) => `/forms/${encodeURIComponent(formId)}/edit`,
	formFill: (formId: string) => `/forms/${encodeURIComponent(formId)}`,
	formResponses: (formId: string) =>
		`/forms/${encodeURIComponent(formId)}/responses`,
	responseView: (formId: string, responseId: string) =>
		`/forms/${encodeURIComponent(formId)}/responses/${encodeURIComponent(responseId)}`,
} as const;
