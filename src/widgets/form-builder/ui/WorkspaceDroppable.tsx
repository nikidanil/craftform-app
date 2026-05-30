import type { ReactNode, RefObject } from 'react';
import { useDroppable } from '@dnd-kit/core';

import { cn } from '@/shared/lib';
import { WORKSPACE_DROPPABLE_ID } from '../model';
import styles from './FormBuilderForm.module.css';

type Props = {
	workspaceRef: RefObject<HTMLElement | null>;
	children: ReactNode;
};

/**
 * Droppable-зона рабочей области. Вынесена в отдельный компонент, чтобы
 * `useDroppable` вызывался ВНУТРИ `DndContext` — иначе на пустой форме
 * (когда нет карточек-вопросов) перетаскивание не находит цель.
 * Совмещает droppable-ref с внешним `workspaceRef`, который нужен родителю
 * для перевода фокуса после добавления/удаления вопроса.
 */
export const WorkspaceDroppable = ({ workspaceRef, children }: Props) => {
	const { setNodeRef, isOver } = useDroppable({ id: WORKSPACE_DROPPABLE_ID });

	const assignRef = (node: HTMLElement | null) => {
		workspaceRef.current = node;
		setNodeRef(node);
	};

	return (
		<main
			ref={assignRef}
			className={cn(styles.workspace, isOver && styles.workspaceDropActive)}
		>
			{children}
		</main>
	);
};
