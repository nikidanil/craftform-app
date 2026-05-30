import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

import { SIDEBAR_DROPPABLE_ID } from '../model';

type Props = {
	className?: string;
	children: ReactNode;
};

/**
 * Droppable-зона сайдбара. Вынесена в отдельный компонент, чтобы
 * `useDroppable` вызывался ВНУТРИ `DndContext` (а не в компоненте, который
 * сам рендерит контекст) — иначе зона не регистрируется в dnd-kit.
 */
export const SidebarDroppable = ({ className, children }: Props) => {
	const { setNodeRef } = useDroppable({ id: SIDEBAR_DROPPABLE_ID });

	return (
		<aside ref={setNodeRef} className={className}>
			{children}
		</aside>
	);
};
