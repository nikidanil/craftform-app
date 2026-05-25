import { useFormContext, useFormState } from 'react-hook-form';
import type { FormFillValues } from './defaults';

type QuestionFieldError = {
	showError: boolean;
	message: string | undefined;
	errorId: string;
};

/**
 * Возвращает состояние ошибки валидации для поля вопроса. Ошибку показываем
 * только после взаимодействия (touched) — иначе trigger() на маунте пометил бы
 * все обязательные поля невалидными сразу при открытии формы.
 *
 * Точечная подписка через useFormState({ name }) — formState из useFormContext
 * в дочернем компоненте не перерисовывается надёжно при смене touchedFields.
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
