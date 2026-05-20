import { useId } from 'react';
import {
	Controller,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Input, Textarea, Switch, Label, Button } from '@/shared/ui';
import type { QuestionType, FormInput } from '@/entities/form';

import { ChoiceEditor } from './ChoiceEditor';
import styles from './QuestionCard.module.css';

type Props = {
	index: number;
	sortableId: string;
	onRemove: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
};

const TYPE_LABEL: Record<QuestionType, string> = {
	'short-text': 'Короткий текст',
	'long-text': 'Длинный текст',
	choice: 'Список выбора',
};

export const QuestionCard = ({
	index,
	sortableId,
	onRemove,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: Props) => {
	const { control, register, formState } = useFormContext<FormInput>();
	const bodyId = useId();
	const reqId = useId();
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: sortableId });

	const cardStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : undefined,
	};

	const type = useWatch({
		control,
		name: `questions.${index}.type` as const,
	});

	const errors = formState.errors?.questions?.[index] as
		| { body?: { message?: string }; options?: { message?: string } }
		| undefined;

	return (
		<div
			ref={setNodeRef}
			style={cardStyle}
			className={styles.card}
			data-testid='question-card'
			data-type={type}
			data-dragging={isDragging || undefined}
		>
			<button
				ref={setActivatorNodeRef}
				type='button'
				className={styles.handle}
				aria-label={`Перетащить вопрос ${index + 1}`}
				{...attributes}
				{...listeners}
			>
				<svg width='10' height='16' viewBox='0 0 10 16' aria-hidden>
					<circle cx='3' cy='3' r='1.5' fill='currentColor' />
					<circle cx='7' cy='3' r='1.5' fill='currentColor' />
					<circle cx='3' cy='8' r='1.5' fill='currentColor' />
					<circle cx='7' cy='8' r='1.5' fill='currentColor' />
					<circle cx='3' cy='13' r='1.5' fill='currentColor' />
					<circle cx='7' cy='13' r='1.5' fill='currentColor' />
				</svg>
			</button>

			<div className={styles.content}>
				<div className={styles.row}>
					<Label htmlFor={bodyId} className={styles.srOnly}>
						Текст вопроса
					</Label>
					<Input
						id={bodyId}
						aria-label='Текст вопроса'
						placeholder='Введите текст вопроса'
						{...register(`questions.${index}.body` as const)}
					/>
				</div>

				{errors?.body?.message ? (
					<p className={styles.fieldError}>{errors.body.message}</p>
				) : null}

				{type === 'long-text' ? (
					<Textarea
						aria-label='Образец многострочного ответа'
						placeholder='Многострочное поле…'
						readOnly
						className={styles.previewTextarea}
					/>
				) : null}

				{type === 'choice' ? <ChoiceEditor index={index} /> : null}

				<div className={styles.footer}>
					<Controller
						control={control}
						name={`questions.${index}.required` as const}
						render={({ field }) => (
							<div className={styles.requiredRow}>
								<Switch
									id={reqId}
									checked={Boolean(field.value)}
									onCheckedChange={field.onChange}
								/>
								<Label htmlFor={reqId}>Обязательный вопрос</Label>
							</div>
						)}
					/>
					<span className={styles.typeBadge}>{TYPE_LABEL[type]}</span>
				</div>
			</div>

			<div className={styles.actions}>
				<Button
					type='button'
					variant='ghost'
					size='icon-sm'
					aria-label={`Переместить вопрос ${index + 1} вверх`}
					aria-disabled={!canMoveUp}
					onClick={onMoveUp}
				>
					<ArrowUp size={15} aria-hidden />
				</Button>
				<Button
					type='button'
					variant='ghost'
					size='icon-sm'
					aria-label={`Переместить вопрос ${index + 1} вниз`}
					aria-disabled={!canMoveDown}
					onClick={onMoveDown}
				>
					<ArrowDown size={15} aria-hidden />
				</Button>
				<Button
					type='button'
					variant='ghost'
					size='icon-sm'
					aria-label='Удалить вопрос'
					onClick={onRemove}
					className={styles.removeBtn}
				>
					<Trash2 size={15} aria-hidden />
				</Button>
			</div>
		</div>
	);
};
