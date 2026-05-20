import type { QuestionType } from '@/entities/form';

export const WORKSPACE_DROPPABLE_ID = 'workspace';
export const SIDEBAR_DROPPABLE_ID = 'sidebar';
export const NEW_QUESTION_PREFIX = 'new:';

export type NewQuestionDragData = {
	kind: 'new-question';
	questionType: QuestionType;
};

export type DragInterpretation =
	| {
		kind: 'add';
		questionType: QuestionType;
		insertIndex: number | null;
	}
	| { kind: 'reorder'; from: number; to: number }
	| { kind: 'remove'; index: number }
	| { kind: 'noop' };
