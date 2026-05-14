import { useId } from 'react';
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { Input, Textarea, Switch, Label, Button } from '@/shared/ui';
import {
	type ChoiceVariant,
	type QuestionType,
	type FormInput,
} from '@/entities/form';
import { makeEmptyOption } from '@/widgets/form-builder/model/defaults';
import styles from './QuestionCard.module.css';

type Props = {
	index: number;
	onRemove: () => void;
};

const TYPE_LABEL: Record<QuestionType, string> = {
	'short-text': 'Короткий текст',
	'long-text': 'Длинный текст',
	choice: 'Список выбора',
};

export const QuestionCard = ({ index, onRemove }: Props) => {
	const { control, register, formState } = useFormContext<FormInput>();
	const bodyId = useId();
	const reqId = useId();

	const type = useWatch({
		control,
		name: `questions.${index}.type` as const,
	});

	const errors = formState.errors?.questions?.[index] as
		| { body?: { message?: string }; options?: { message?: string } }
		| undefined;

	return (
		<div className={styles.card} data-testid='question-card' data-type={type}>
			<div className={styles.handle} aria-hidden>
				<svg width='10' height='16' viewBox='0 0 10 16'>
					<circle cx='3' cy='3' r='1.5' fill='currentColor' />
					<circle cx='7' cy='3' r='1.5' fill='currentColor' />
					<circle cx='3' cy='8' r='1.5' fill='currentColor' />
					<circle cx='7' cy='8' r='1.5' fill='currentColor' />
					<circle cx='3' cy='13' r='1.5' fill='currentColor' />
					<circle cx='7' cy='13' r='1.5' fill='currentColor' />
				</svg>
			</div>

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

				{type === 'choice' ? (
					<ChoiceEditor index={index} />
				) : null}

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

			<Button
				type='button'
				variant='ghost'
				size='icon-sm'
				aria-label='Удалить вопрос'
				onClick={onRemove}
				className={styles.removeBtn}
			>
				<svg
					width='15'
					height='15'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.5'
				>
					<polyline points='3 6 5 6 21 6' />
					<path d='M19 6l-1 14H6L5 6' />
					<path d='M10 11v6M14 11v6M9 6V4h6v2' />
				</svg>
			</Button>
		</div>
	);
};

const VARIANTS: { value: ChoiceVariant; label: string }[] = [
	{ value: 'single', label: 'Один вариант' },
	{ value: 'multiple', label: 'Несколько вариантов' },
];

const ChoiceEditor = ({ index }: { index: number }) => {
	const { control, register, formState } = useFormContext<FormInput>();
	const optionsArray = useFieldArray({
		control,
		name: `questions.${index}.options` as 'questions.0.options',
	});

	const questionErrors = formState.errors?.questions?.[index] as
		| {
				options?:
					| { message?: string }
					| Array<{ label?: { message?: string } } | undefined>;
		  }
		| undefined;

	const optionsErrorMessage =
		questionErrors?.options &&
		!Array.isArray(questionErrors.options) &&
		typeof questionErrors.options === 'object'
			? questionErrors.options.message
			: undefined;

	return (
		<div className={styles.choice}>
			<Controller
				control={control}
				name={`questions.${index}.choiceVariant` as const}
				render={({ field }) => (
					<div role='group' aria-label='Тип списка выбора' className={styles.toggleGroup}>
						{VARIANTS.map((v) => {
							const active = (field.value ?? 'single') === v.value;
							return (
								<button
									key={v.value}
									type='button'
									aria-pressed={active}
									className={styles.toggleBtn}
									data-active={active}
									onClick={() => field.onChange(v.value)}
								>
									{v.label}
								</button>
							);
						})}
					</div>
				)}
			/>

			<div className={styles.options}>
				{optionsArray.fields.map((field, optIndex) => (
					<div key={field.id} className={styles.option}>
						<span className={styles.bullet} aria-hidden />
						<Input
							aria-label={`Вариант ответа ${optIndex + 1}`}
							placeholder='Текст варианта'
							{...register(
								`questions.${index}.options.${optIndex}.label` as const,
							)}
						/>
						<Button
							type='button'
							variant='ghost'
							size='icon-sm'
							aria-label={`Удалить вариант ${optIndex + 1}`}
							onClick={() => optionsArray.remove(optIndex)}
						>
							×
						</Button>
					</div>
				))}
				<Button
					type='button'
					variant='link'
					size='sm'
					onClick={() => optionsArray.append(makeEmptyOption())}
					className={styles.addOptionBtn}
				>
					+ Добавить вариант
				</Button>
				{optionsErrorMessage ? (
					<p className={styles.fieldError}>{optionsErrorMessage}</p>
				) : null}
			</div>
		</div>
	);
};
