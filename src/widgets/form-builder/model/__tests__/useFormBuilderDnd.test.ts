import { describe, expect, it } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';

import {
	NEW_QUESTION_PREFIX,
	SIDEBAR_DROPPABLE_ID,
	WORKSPACE_DROPPABLE_ID,
} from '../dndProtocol';
import { interpretDragEnd } from '../useFormBuilderDnd';

type EventInput = {
	active: { id: string; data?: unknown };
	over: { id: string } | null;
};

const makeEvent = ({ active, over }: EventInput): DragEndEvent =>
	// dnd-kit не экспортирует фабрику событий — приводим минимальный объект к типу.
	({
		active: {
			id: active.id,
			data: { current: active.data },
			rect: { current: { initial: null, translated: null } },
		},
		over: over
			? {
				id: over.id,
				data: { current: undefined },
				rect: { initial: null, translated: null },
				disabled: false,
			}
			: null,
		delta: { x: 0, y: 0 },
		collisions: null,
		activatorEvent: new Event('mousedown'),
	}) as unknown as DragEndEvent;

const fieldIds = ['field-a', 'field-b', 'field-c'];

describe('interpretDragEnd', () => {
	describe('перетаскивание нового типа из боковой панели', () => {
		it('дроп в пустую часть рабочей области добавляет в конец', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: {
						id: `${NEW_QUESTION_PREFIX}short-text`,
						data: { kind: 'new-question', questionType: 'short-text' },
					},
					over: { id: WORKSPACE_DROPPABLE_ID },
				}),
				fieldIds,
			);

			expect(result).toEqual({
				kind: 'add',
				questionType: 'short-text',
				insertIndex: null,
			});
		});

		it('дроп на существующую карточку вставляет перед ней', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: {
						id: `${NEW_QUESTION_PREFIX}choice`,
						data: { kind: 'new-question', questionType: 'choice' },
					},
					over: { id: 'field-b' },
				}),
				fieldIds,
			);

			expect(result).toEqual({
				kind: 'add',
				questionType: 'choice',
				insertIndex: 1,
			});
		});

		it('дроп в пустоту не добавляет вопрос', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: {
						id: `${NEW_QUESTION_PREFIX}long-text`,
						data: { kind: 'new-question', questionType: 'long-text' },
					},
					over: null,
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});

		it('дроп на боковую панель не добавляет вопрос', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: {
						id: `${NEW_QUESTION_PREFIX}short-text`,
						data: { kind: 'new-question', questionType: 'short-text' },
					},
					over: { id: SIDEBAR_DROPPABLE_ID },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});
	});

	describe('перетаскивание существующего вопроса', () => {
		it('дроп вне любого droppable удаляет вопрос', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-a' },
					over: null,
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'remove', index: 0 });
		});

		it('дроп на боковую панель не удаляет вопрос (защита от ложного срабатывания)', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-b' },
					over: { id: SIDEBAR_DROPPABLE_ID },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});

		it('дроп в пустую часть рабочей области ничего не меняет', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-b' },
					over: { id: WORKSPACE_DROPPABLE_ID },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});

		it('дроп на самого себя ничего не меняет', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-b' },
					over: { id: 'field-b' },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});

		it('дроп на неизвестный droppable ничего не меняет', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-a' },
					over: { id: 'unknown-droppable' },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'noop' });
		});

		it('дроп на соседнюю карточку переупорядочивает', () => {
			const result = interpretDragEnd(
				makeEvent({
					active: { id: 'field-a' },
					over: { id: 'field-c' },
				}),
				fieldIds,
			);

			expect(result).toEqual({ kind: 'reorder', from: 0, to: 2 });
		});
	});
});
