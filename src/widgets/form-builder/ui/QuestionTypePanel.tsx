import { AlignLeft, List, Type } from 'lucide-react';

import type { QuestionType } from '@/entities/form';

import { QuestionTypeTile, type Tile } from './QuestionTypeTile';
import styles from './QuestionTypePanel.module.css';

type Props = {
	onAdd: (type: QuestionType) => void;
};

const TILES: Tile[] = [
	{
		type: 'short-text',
		label: 'Короткий текст',
		desc: 'Однострочный ввод',
		tone: 'short',
		icon: Type,
	},
	{
		type: 'long-text',
		label: 'Длинный текст',
		desc: 'Многострочный ввод',
		tone: 'long',
		icon: AlignLeft,
	},
	{
		type: 'choice',
		label: 'Список выбора',
		desc: 'Переключатели или флажки',
		tone: 'choice',
		icon: List,
	},
];

export const QuestionTypePanel = ({ onAdd }: Props) => (
	<div className={styles.panel}>
		<p className={styles.title}>Типы вопросов</p>
		<p className={styles.hint}>Перетащите или кликните, чтобы добавить</p>
		<div className={styles.list}>
			{TILES.map((tile) => (
				<QuestionTypeTile key={tile.type} tile={tile} onAdd={onAdd} />
			))}
		</div>
	</div>
);
