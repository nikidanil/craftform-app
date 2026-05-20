import {
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import {
	SIDEBAR_DROPPABLE_ID,
	WORKSPACE_DROPPABLE_ID,
	type DragInterpretation,
	type NewQuestionDragData,
} from './dndProtocol';

const isNewQuestionData = (
	data: unknown,
): data is NewQuestionDragData =>
	typeof data === 'object' &&
	data !== null &&
	(data as { kind?: unknown }).kind === 'new-question';

export const interpretDragEnd = (
	event: DragEndEvent,
	fieldIds: readonly string[],
): DragInterpretation => {
	const { active, over } = event;
	const data = active.data.current;

	if (isNewQuestionData(data)) {
		if (over === null) return { kind: 'noop' };
		const overId = over.id;
		if (overId === WORKSPACE_DROPPABLE_ID) {
			return {
				kind: 'add',
				questionType: data.questionType,
				insertIndex: null,
			};
		}
		const insertIndex = fieldIds.indexOf(String(overId));
		if (insertIndex !== -1) {
			return {
				kind: 'add',
				questionType: data.questionType,
				insertIndex,
			};
		}
		return { kind: 'noop' };
	}

	const activeIndex = fieldIds.indexOf(String(active.id));
	if (activeIndex === -1) return { kind: 'noop' };

	if (over === null) return { kind: 'remove', index: activeIndex };

	const overId = over.id;
	if (overId === SIDEBAR_DROPPABLE_ID) return { kind: 'noop' };
	if (overId === WORKSPACE_DROPPABLE_ID) return { kind: 'noop' };
	if (overId === active.id) return { kind: 'noop' };

	const targetIndex = fieldIds.indexOf(String(overId));
	if (targetIndex === -1) return { kind: 'noop' };
	return { kind: 'reorder', from: activeIndex, to: targetIndex };
};

export const useFormBuilderDnd = () => {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return { sensors };
};
