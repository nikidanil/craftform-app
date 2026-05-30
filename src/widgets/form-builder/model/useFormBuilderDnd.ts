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

/**
 * Превращает событие окончания перетаскивания в чистое описание операции, не
 * трогая состояние (поэтому легко тестируется в изоляции).
 *
 * Зачем: тащить можно либо новый тип вопроса из сайдбара (`data` —
 * `NewQuestionDragData`), либо существующую карточку. Возвращает
 * дискриминированный результат:
 * - `add` — добавить вопрос `questionType` в `insertIndex` (или в конец при `null`);
 * - `reorder` — переставить с `from` на `to`;
 * - `remove` — существующую карточку бросили мимо области (`over === null`) → удаление;
 * - `noop` — без эффекта: бросок в сайдбар, на себя или на рабочую область без
 *   целевой карточки; для НОВОГО вопроса бросок мимо (`over === null`) — тоже `noop`.
 *
 * @param event — событие `onDragEnd` от dnd-kit
 * @param fieldIds — порядок id карточек-вопросов (перевод id ↔ индекс)
 * @returns описание операции (`DragInterpretation`)
 */
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

/**
 * Применяет результат {@link interpretDragEnd} к списку вопросов через переданные
 * helpers (`append`/`insert`/`move`/`remove` от react-hook-form `useFieldArray`).
 *
 * @param interpretation — что сделать (из `interpretDragEnd`)
 * @param helpers — операции над списком и его текущий `size`
 */
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

/**
 * Готовит сенсоры dnd-kit для конструктора форм.
 *
 * Зачем: PointerSensor с `activationConstraint.distance: 8` — перетаскивание
 * стартует только после сдвига на 8px, чтобы обычные клики по карточке и кнопкам
 * не воспринимались как drag. KeyboardSensor с `sortableKeyboardCoordinates` —
 * доступность: сортировка с клавиатуры. Интерпретация дропа вынесена в чистые
 * `interpretDragEnd` / `applyDragInterpretation` (этот хук отвечает только за сенсоры).
 *
 * @returns `{ sensors }` для `<DndContext sensors={sensors}>`
 */
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
