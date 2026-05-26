import {
	KeyboardSensor,
	PointerSensor,
	pointerWithin,
	rectIntersection,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { Question } from '@/entities/form';

import { makeEmptyQuestion } from './defaults';
import {
	SIDEBAR_DROPPABLE_ID,
	WORKSPACE_DROPPABLE_ID,
	isNewQuestionDragData,
	type DragInterpretation,
} from './dndProtocol';

export type DragApplyHelpers = {
	append: (question: Question) => void;
	insert: (index: number, question: Question) => void;
	move: (from: number, to: number) => void;
	remove: (index: number) => void;
	size: number;
};

/**
 * Сначала ищем droppable под курсором (`pointerWithin`) — это надёжно
 * находит пустую рабочую область, у которой почти нет содержимого. Если
 * под курсором ничего нет, падаем на пересечение прямоугольников
 * (`rectIntersection`) для сортировки уже существующих карточек.
 */
export const formBuilderCollisionDetection: CollisionDetection = (args) => {
	const pointerCollisions = pointerWithin(args);
	if (pointerCollisions.length > 0) return pointerCollisions;
	return rectIntersection(args);
};

export const interpretDragEnd = (
	event: DragEndEvent,
	fieldIds: readonly string[],
): DragInterpretation => {
	const { active, over } = event;
	const data = active.data.current;

	if (isNewQuestionDragData(data)) {
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

export const applyDragInterpretation = (
	interpretation: DragInterpretation,
	helpers: DragApplyHelpers,
): void => {
	switch (interpretation.kind) {
		case 'add': {
			const newQuestion = makeEmptyQuestion(
				interpretation.questionType,
				helpers.size,
			);
			if (interpretation.insertIndex === null) {
				helpers.append(newQuestion);
			} else {
				helpers.insert(interpretation.insertIndex, newQuestion);
			}
			return;
		}
		case 'reorder':
			helpers.move(interpretation.from, interpretation.to);
			return;
		case 'remove':
			helpers.remove(interpretation.index);
			return;
		case 'noop':
			return;
	}
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
