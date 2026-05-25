import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { useToastStore, toast, TOAST_DURATION_MS } from '../store';

describe('useToastStore', () => {
	beforeEach(() => {
		useToastStore.setState({ toasts: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('toast.success добавляет тост с вариантом default в очередь', () => {
		toast.success('Ссылка скопирована');

		const { toasts } = useToastStore.getState();
		expect(toasts).toHaveLength(1);
		expect(toasts[0].message).toBe('Ссылка скопирована');
		expect(toasts[0].variant).toBe('default');
	});

	it('toast.error добавляет тост с вариантом destructive', () => {
		toast.error('Не удалось скопировать ссылку');

		const { toasts } = useToastStore.getState();
		expect(toasts[0].variant).toBe('destructive');
	});

	it('тост автоматически исчезает по истечении таймаута', () => {
		toast.success('Ссылка скопирована');
		expect(useToastStore.getState().toasts).toHaveLength(1);

		vi.advanceTimersByTime(TOAST_DURATION_MS);

		expect(useToastStore.getState().toasts).toHaveLength(0);
	});

	it('dismissToast убирает конкретный тост по id, не трогая остальные', () => {
		const errorId = toast.error('Ошибка');
		toast.success('Готово');

		useToastStore.getState().dismissToast(errorId);

		const { toasts } = useToastStore.getState();
		expect(toasts).toHaveLength(1);
		expect(toasts[0].message).toBe('Готово');
	});
});
