import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '@/features/save-form';

export type NoticeTone = 'pending' | 'success' | 'error' | 'info';
export type BuilderNotice = { tone: NoticeTone; text: string } | null;

const SUCCESS_TIMEOUT_MS = 2500;
const ERROR_TIMEOUT_MS = 5000;

type Transient = { tone: 'success' | 'error'; text: string } | null;

type Params = {
	saveStatus: SaveStatus;
	hasSavedOnce: boolean;
};

export const useBuilderNotice = ({ saveStatus, hasSavedOnce }: Params) => {
	const [transient, setTransient] = useState<Transient>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const show = useCallback(
		(tone: 'success' | 'error', text: string) => {
			clearTimer();
			setTransient({ tone, text });
			timerRef.current = setTimeout(
				() => setTransient(null),
				tone === 'error' ? ERROR_TIMEOUT_MS : SUCCESS_TIMEOUT_MS,
			);
		},
		[clearTimer],
	);

	useEffect(() => {
		return clearTimer;
	}, [clearTimer]);

	const notifySaved = () => show('success', 'Сохранено');
	const notifySaveError = () => show('error', 'Не удалось сохранить форму');
	const notifyCopied = () => show('success', 'Ссылка скопирована');
	const notifyCopyError = () => show('error', 'Не удалось скопировать ссылку');

	let notice: BuilderNotice = null;
	if (saveStatus === 'pending') {
		notice = { tone: 'pending', text: 'Сохранение…' };
	} else if (transient) {
		notice = transient;
	} else if (hasSavedOnce) {
		notice = { tone: 'info', text: 'Изменения сохранены' };
	}

	return {
		notice,
		notifySaved,
		notifySaveError,
		notifyCopied,
		notifyCopyError,
	};
};
