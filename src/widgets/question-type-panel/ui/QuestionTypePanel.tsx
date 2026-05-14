import type { QuestionType } from '@/entities/form';
import styles from './QuestionTypePanel.module.css';

type Props = {
	onAdd: (type: QuestionType) => void;
};

type Tile = {
	type: QuestionType;
	label: string;
	desc: string;
	tone: 'short' | 'long' | 'choice';
};

const TILES: Tile[] = [
	{
		type: 'short-text',
		label: 'Короткий текст',
		desc: 'Однострочный ввод',
		tone: 'short',
	},
	{
		type: 'long-text',
		label: 'Длинный текст',
		desc: 'Многострочный ввод',
		tone: 'long',
	},
	{
		type: 'choice',
		label: 'Список выбора',
		desc: 'Переключатели или флажки',
		tone: 'choice',
	},
];

export const QuestionTypePanel = ({ onAdd }: Props) => (
	<div className={styles.panel}>
		<p className={styles.title}>Типы вопросов</p>
		<p className={styles.hint}>Кликните, чтобы добавить</p>
		<div className={styles.list}>
			{TILES.map((tile) => (
				<button
					key={tile.type}
					type='button'
					aria-label={tile.label}
					className={styles.tile}
					data-tone={tile.tone}
					onClick={() => onAdd(tile.type)}
				>
					<span className={styles.icon} data-tone={tile.tone} aria-hidden />
					<span className={styles.body}>
						<span className={styles.label}>{tile.label}</span>
						<span className={styles.desc}>{tile.desc}</span>
					</span>
				</button>
			))}
		</div>
	</div>
);
