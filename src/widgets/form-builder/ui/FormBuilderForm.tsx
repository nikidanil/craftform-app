import { useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
	FormProvider,
	useFieldArray,
	useForm,
	useWatch,
	type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import styles from './FormBuilderForm.module.css';

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

export const FormBuilderForm = (props: Props) => {
	const titleId = useId();
	const descId = useId();
	const navigate = useNavigate();
	const workspaceRef = useRef<HTMLElement>(null);
	const pendingFocusRef = useRef<PendingFocus>(null);

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
			questions: values.questions.map((q, idx) => ({ ...q, order: idx })),
		};
		await save(normalized);
	};

	return (
		<FormProvider {...methods}>
			<form
				className={styles.layout}
				onSubmit={methods.handleSubmit(onSubmit)}
				noValidate
			>
				<aside className={styles.sidebar}>
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

				<main ref={workspaceRef} className={styles.workspace}>
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

					<div className={styles.questions}>
						{questionsArray.fields.map((field, index) => (
							<QuestionCard
								key={field.id}
								index={index}
								sortableId={field.id}
								canMoveUp={index > 0}
								canMoveDown={index < questionsArray.fields.length - 1}
								onMoveUp={() => handleMoveUp(index)}
								onMoveDown={() => handleMoveDown(index)}
								onRemove={() => handleRemove(index)}
							/>
						))}
					</div>

					{questionsArray.fields.length === 0 ? (
						<div className={styles.hint}>
							Нажмите на тип вопроса слева, чтобы добавить
						</div>
					) : null}
				</main>
			</form>
		</FormProvider>
	);
};
