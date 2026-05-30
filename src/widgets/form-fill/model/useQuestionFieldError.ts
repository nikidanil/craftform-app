import { useFormContext, useFormState } from 'react-hook-form';
import type { FormFillValues } from './defaults';

type QuestionFieldError = {
	showError: boolean;
	message: string | undefined;
	errorId: string;
};

/**
 * Состояние ошибки валидации одного поля-вопроса на публичной странице формы.
 *
 * Зачем: ошибку показываем только после взаимодействия (touched) — иначе
 * `trigger()` на маунте пометил бы все обязательные поля невалидными сразу при
 * открытии формы. Точечная подписка через `useFormState({ name })` — formState из
 * useFormContext в дочернем компоненте не перерисовывается надёжно при смене
 * touchedFields.
 *
 * @param questionId — id вопроса (он же имя поля в react-hook-form)
 * @returns `{ showError, message, errorId }` — показывать ли ошибку, её текст и
 *   `id` для `aria-describedby` (формат `` `${questionId}-error` ``)
 * @example
 * const { showError, message, errorId } = useQuestionFieldError(question.id);
 */
export const useQuestionFieldError = (
	questionId: string,
): QuestionFieldError => {
	const { control } = useFormContext<FormFillValues>();
	// name — динамический id вопроса; FormFillValues = Record<string, …>,
	// поэтому Path<…> здесь сводится к string (не опечатка).
	const { errors, touchedFields } = useFormState<FormFillValues>({
		control,
		name: questionId,
	});

	const error = errors[questionId];
	const showError = Boolean(touchedFields[questionId]) && Boolean(error);

	return {
		showError,
		message: typeof error?.message === 'string' ? error.message : undefined,
		errorId: `${questionId}-error`,
	};
};
