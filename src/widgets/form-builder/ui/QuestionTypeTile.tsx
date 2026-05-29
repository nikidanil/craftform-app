import { useDraggable } from '@dnd-kit/core';
import type { LucideIcon } from 'lucide-react';

import type { QuestionType } from '@/entities/form';

import { NEW_QUESTION_PREFIX, type NewQuestionDragData } from '../model/dndProtocol';
import styles from './QuestionTypePanel.module.css';

export type Tone = 'short' | 'long' | 'choice';

export type Tile = {
	type: QuestionType;
	label: string;
	desc: string;
	tone: Tone;
	icon: LucideIcon;
};

type Props = {
	tile: Tile;
	onAdd: (type: QuestionType) => void;
};

export const QuestionTypeTile = ({ tile, onAdd }: Props) => {
	const data: NewQuestionDragData = {
		kind: 'new-question',
		questionType: tile.type,
	};
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `${NEW_QUESTION_PREFIX}${tile.type}`,
		data,
	});
	const Icon = tile.icon;

	return (
		<button
			ref={setNodeRef}
			type='button'
			aria-label={tile.label}
			className={styles.tile}
			data-tone={tile.tone}
			data-dragging={isDragging || undefined}
			onClick={() => onAdd(tile.type)}
			{...attributes}
			{...listeners}
			aria-pressed={undefined}
		>
			<span className={styles.icon} data-tone={tile.tone} aria-hidden>
				<Icon size={14} strokeWidth={2.5} />
			</span>
			<span className={styles.body}>
				<span className={styles.label}>{tile.label}</span>
				<span className={styles.desc}>{tile.desc}</span>
			</span>
		</button>
	);
};
