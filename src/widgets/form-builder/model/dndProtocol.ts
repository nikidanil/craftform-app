import type { QuestionType } from '@/entities/form';

// Протокол DnD для конструктора форм. Виджет question-type-panel
// импортирует константы и тип-guard через barrel
// @/widgets/form-builder. Файл лежит в form-builder/model — это
// контракт взаимодействия внутри одного составного виджета;
// переносить в shared/lib пока не имеет смысла.

export const WORKSPACE_DROPPABLE_ID = 'workspace';
export const SIDEBAR_DROPPABLE_ID = 'sidebar';
export const NEW_QUESTION_PREFIX = 'new:';

export type NewQuestionDragData = {
	kind: 'new-question';
	questionType: QuestionType;
};

export const isNewQuestionDragData = (
	data: unknown,
): data is NewQuestionDragData =>
	typeof data === 'object' &&
	data !== null &&
	'kind' in data &&
	data.kind === 'new-question';

export type DragInterpretation =
	| {
		kind: 'add';
		questionType: QuestionType;
		insertIndex: number | null;
	}
	| { kind: 'reorder'; from: number; to: number }
	| { kind: 'remove'; index: number }
	| { kind: 'noop' };
