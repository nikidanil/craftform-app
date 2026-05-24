import { describe, it, expect } from 'vitest';
import { routes, routePaths } from '@/shared/lib';

describe('routes', () => {
	it('строит путь редактирования формы и кодирует formId', () => {
		expect(routes.formEdit('a/b 1')).toBe('/forms/a%2Fb%201/edit');
	});

	it('строит путь просмотра отклика и кодирует оба параметра', () => {
		expect(routes.responseView('f/1', 'r 2')).toBe(
			'/forms/f%2F1/responses/r%202',
		);
	});

	it('статические пути совпадают с шаблонами роутера', () => {
		expect(routes.home).toBe(routePaths.home);
		expect(routes.formNew).toBe(routePaths.formNew);
		expect(routes.profile).toBe(routePaths.profile);
	});
});
