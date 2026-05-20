import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	FormProvider,
	useFieldArray,
	useForm,
	useWatch,
	type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	DndContext,
	DragOverlay,
	useDroppable,
	type Announcements,
	type DragEndEvent,
	type DragStartEvent,
	type ScreenReaderInstructions,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { cn } from '@/shared/lib';
import { Input, Textarea, Label } from '@/shared/ui';
import type { Form, FormInput, QuestionType } from '@/entities/form';
import { QuestionTypePanel } from '@/widgets/question-type-panel';
import { QuestionCard } from '@/widgets/question-card';
import {
	SaveFormButton,
	SaveFormStatus,
	useSaveForm,
} from '@/features/save-form';
import {
	CopyFormLinkButton,
} from '@/features/copy-form-link';
import { DeleteFormButton } from '@/features/delete-form';

import { emptyFormInput, makeEmptyQuestion } from '../model/defaults';
import { formBuilderSchema, type FormBuilderValues } from '../model/schema';
import {
	SIDEBAR_DROPPABLE_ID,
	WORKSPACE_DROPPABLE_ID,
	isNewQuestionDragData,
} from '../model/dndProtocol';
import {
	applyDragInterpretation,
	interpretDragEnd,
	useFormBuilderDnd,
} from '../model/useFormBuilderDnd';
import styles from './FormBuilderForm.module.css';

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
	'short-text': 'Короткий текст',
	'long-text': 'Длинный текст',
	choice: 'Список выбора',
};

const screenReaderInstructions: ScreenReaderInstructions = {
	draggable:
		'Чтобы начать перетаскивание, нажмите пробел. Используйте стрелки для перемещения. Отпустите пробел, чтобы зафиксировать. Esc — отмена.',
};

const announcements: Announcements = {
	onDragStart: () => 'Перетаскивание начато',
	onDragOver: ({ over }) =>
		over ? 'Цель перетаскивания найдена' : 'Цель перетаскивания не выбрана',
	onDragEnd: ({ over }) =>
		over ? 'Перетаскивание завершено' : 'Перетаскивание отменено',
	onDragCancel: () => 'Перетаскивание отменено',
};

type CreateProps = { mode: 'create' };
type EditProps = { mode: 'edit'; form: Form };
type Props = CreateProps | EditProps;

const toDefaults = (form: Form): FormInput => ({
	title: form.title,
	description: form.description,
	questions: form.questions,
});

type PendingFocus =
	| { kind: 'title' }
	| { kind: 'question'; index: number }
	| null;

type ActiveDrag =
	| { kind: 'new-question'; questionType: QuestionType }
	| { kind: 'sortable'; questionBody: string }
	| null;

export const FormBuilderForm = (props: Props) => {
	const titleId = useId();
	const descId = useId();
	const navigate = useNavigate();
	const workspaceRef = useRef<HTMLElement>(null);
	const pendingFocusRef = useRef<PendingFocus>(null);
	const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);

	const methods = useForm<FormBuilderValues>({
		resolver: zodResolver(formBuilderSchema),
		defaultValues:
			props.mode === 'edit'
				? (toDefaults(props.form) as FormBuilderValues)
				: (emptyFormInput() as FormBuilderValues),
		mode: 'onChange',
	});

	const questionsArray = useFieldArray({
		control: methods.control,
		name: 'questions',
	});

	const { sensors } = useFormBuilderDnd();
	const {
		setNodeRef: setWorkspaceDroppableRef,
		isOver: isWorkspaceOver,
	} = useDroppable({ id: WORKSPACE_DROPPABLE_ID });
	const { setNodeRef: setSidebarDroppableRef } = useDroppable({
		id: SIDEBAR_DROPPABLE_ID,
	});

	const assignWorkspaceRef = (node: HTMLElement | null) => {
		workspaceRef.current = node;
		setWorkspaceDroppableRef(node);
	};

	useEffect(() => {
		const pending = pendingFocusRef.current;
		if (!pending) return;
		const workspace = workspaceRef.current;
		if (!workspace) return;
		pendingFocusRef.current = null;
		if (pending.kind === 'title') {
			workspace
				.querySelector<HTMLInputElement>(`#${CSS.escape(titleId)}`)
				?.focus();
			return;
		}
		const cards = workspace.querySelectorAll<HTMLElement>(
			'[data-testid="question-card"]',
		);
		const card = cards[pending.index];
		card
			?.querySelector<HTMLInputElement>('input[aria-label="Текст вопроса"]')
			?.focus();
	}, [questionsArray.fields.length, titleId]);

	const handleRemove = (index: number) => {
		const nextLength = questionsArray.fields.length - 1;
		pendingFocusRef.current =
			nextLength === 0
				? { kind: 'title' }
				: { kind: 'question', index: Math.min(index, nextLength - 1) };
		questionsArray.remove(index);
	};

	const handleMoveUp = (index: number) => {
		if (index === 0) return;
		questionsArray.move(index, index - 1);
	};

	const handleMoveDown = (index: number) => {
		if (index >= questionsArray.fields.length - 1) return;
		questionsArray.move(index, index + 1);
	};

	const saveOptions =
		props.mode === 'edit'
			? ({ mode: 'edit', formId: props.form.id } as const)
			: ({ mode: 'create' } as const);
	const { save, status, error, reset } = useSaveForm(saveOptions);

	const formId = props.mode === 'edit' ? props.form.id : undefined;

	const titleValue = useWatch({ control: methods.control, name: 'title' });
	const isSaveDisabled =
		!titleValue?.trim() ||
		questionsArray.fields.length === 0 ||
		status === 'pending';

	const onAddQuestion = (type: QuestionType) => {
		reset();
		questionsArray.append(makeEmptyQuestion(type, questionsArray.fields.length));
	};

	const onSubmit: SubmitHandler<FormBuilderValues> = async (values) => {
		const normalized: FormInput = {
			...values,
			questions: values.questions.map((question, questionIndex) => ({
				...question,
				order: questionIndex,
			})),
		};
		await save(normalized);
	};

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current;
		if (isNewQuestionDragData(data)) {
			setActiveDrag({ kind: 'new-question', questionType: data.questionType });
			return;
		}
		const fieldIndex = questionsArray.fields.findIndex(
			(field) => field.id === event.active.id,
		);
		const body =
			fieldIndex !== -1
				? methods.getValues(`questions.${fieldIndex}.body`) ?? ''
				: '';
		setActiveDrag({ kind: 'sortable', questionBody: body });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveDrag(null);
		const interpretation = interpretDragEnd(
			event,
			questionsArray.fields.map((field) => field.id),
		);
		applyDragInterpretation(interpretation, {
			append: questionsArray.append,
			insert: questionsArray.insert,
			move: questionsArray.move,
			remove: handleRemove,
			size: questionsArray.fields.length,
		});
	};

	const handleDragCancel = () => setActiveDrag(null);

	const workspaceClass = cn(
		styles.workspace,
		isWorkspaceOver && styles.workspaceDropActive,
	);

	const overlayLabel =
		activeDrag?.kind === 'new-question'
			? `Новый вопрос: ${QUESTION_TYPE_LABEL[activeDrag.questionType]}`
			: activeDrag?.kind === 'sortable'
				? activeDrag.questionBody || 'Вопрос'
				: null;

	return (
		<FormProvider {...methods}>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
				accessibility={{ announcements, screenReaderInstructions }}
			>
				<form
					className={styles.layout}
					onSubmit={methods.handleSubmit(onSubmit)}
					noValidate
				>
					<aside ref={setSidebarDroppableRef} className={styles.sidebar}>
						<QuestionTypePanel onAdd={onAddQuestion} />
						<div className={styles.actions}>
							<SaveFormButton
								disabled={isSaveDisabled}
								pending={status === 'pending'}
							/>
							<CopyFormLinkButton formId={formId} />
							<DeleteFormButton
								formId={
									props.mode === 'edit' ? props.form.id : undefined
								}
							/>
							{props.mode === 'edit' ? (
								<button
									type='button'
									className={styles.cancelLink}
									onClick={() => navigate('/')}
								>
									Назад к списку
								</button>
							) : null}
						</div>
					</aside>

					<main ref={assignWorkspaceRef} className={workspaceClass}>
						<SaveFormStatus status={status} error={error} />

						<div className={styles.metaCard}>
							<Label htmlFor={titleId} className={styles.metaLabel}>
								Название формы
							</Label>
							<Input
								id={titleId}
								className={styles.metaTitle}
								placeholder='Название формы'
								{...methods.register('title')}
							/>
							{methods.formState.errors.title?.message ? (
								<p className={styles.fieldError}>
									{methods.formState.errors.title.message}
								</p>
							) : null}

							<Label htmlFor={descId} className={styles.metaLabel}>
								Описание формы
							</Label>
							<Textarea
								id={descId}
								className={styles.metaDesc}
								placeholder='Описание формы (необязательно)'
								{...methods.register('description')}
							/>
						</div>

						<SortableContext
							items={questionsArray.fields.map((field) => field.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className={styles.questions}>
								{questionsArray.fields.map((field, index) => (
									<QuestionCard
										key={field.id}
										index={index}
										sortableId={field.id}
										canMoveUp={index > 0}
										canMoveDown={
											index < questionsArray.fields.length - 1
										}
										onMoveUp={() => handleMoveUp(index)}
										onMoveDown={() => handleMoveDown(index)}
										onRemove={() => handleRemove(index)}
									/>
								))}
							</div>
						</SortableContext>

						{questionsArray.fields.length === 0 ? (
							<div className={styles.hint}>
								Перетащите тип вопроса слева или кликните по нему,
								чтобы добавить
							</div>
						) : null}
					</main>
				</form>
				<DragOverlay>
					{overlayLabel ? (
						<div className={styles.dragOverlay} role='presentation'>
							{overlayLabel}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</FormProvider>
	);
};
