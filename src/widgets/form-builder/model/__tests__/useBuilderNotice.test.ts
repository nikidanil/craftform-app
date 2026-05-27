import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderNotice } from '../useBuilderNotice';

describe('useBuilderNotice', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('статус «Сохранение…» вытесняет временное уведомление', () => {
		const { result, rerender } = renderHook(
			(props) => useBuilderNotice(props),
			{ initialProps: { saveStatus: 'idle' as const, hasSavedOnce: false } },
		);

		act(() => result.current.notifyCopied());
		expect(result.current.notice).toEqual({
			tone: 'success',
			text: 'Ссылка скопирована',
		});

		rerender({ saveStatus: 'pending', hasSavedOnce: false });
		expect(result.current.notice).toEqual({
			tone: 'pending',
			text: 'Сохранение…',
		});
	});

	it('успех исчезает через 2.5 c и уступает базовому «Изменения сохранены»', () => {
		const { result } = renderHook(() =>
			useBuilderNotice({ saveStatus: 'idle', hasSavedOnce: true }),
		);

		act(() => result.current.notifySaved());
		expect(result.current.notice).toEqual({
			tone: 'success',
			text: 'Сохранено',
		});

		act(() => vi.advanceTimersByTime(2500));
		expect(result.current.notice).toEqual({
			tone: 'info',
			text: 'Изменения сохранены',
		});
	});

	it('ошибка держится дольше успеха (5 c)', () => {
		const { result } = renderHook(() =>
			useBuilderNotice({ saveStatus: 'idle', hasSavedOnce: false }),
		);

		act(() => result.current.notifyCopyError());
		expect(result.current.notice?.tone).toBe('error');

		act(() => vi.advanceTimersByTime(2500));
		expect(result.current.notice?.tone).toBe('error');

		act(() => vi.advanceTimersByTime(2500));
		expect(result.current.notice).toBeNull();
	});
});
