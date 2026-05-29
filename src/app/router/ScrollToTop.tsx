import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Сбрасывает прокрутку окна наверх при каждой смене маршрута.
 * React Router не делает этого сам, из-за чего переход с проскролленной
 * страницы (например, со списка форм на `/forms/new`) открывал новую
 * страницу уже прокрученной вниз.
 */
export const ScrollToTop = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
};
