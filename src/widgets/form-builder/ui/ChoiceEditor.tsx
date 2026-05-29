import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { X } from 'lucide-react';

import { Input, Button } from '@/shared/ui';
import type { ChoiceVariant, FormInput } from '@/entities/form';

import { makeEmptyOption } from '../model/defaults';
import styles from './QuestionCard.module.css';

type Props = { index: number };

const VARIANTS: { value: ChoiceVariant; label: string }[] = [
	{ value: 'single', label: 'Один вариант' },
	{ value: 'multiple', label: 'Несколько вариантов' },
];

export const ChoiceEditor = ({ index }: Props) => {
	const { control, register, formState } = useFormContext<FormInput>();
	const optionsArray = useFieldArray({
		control,
		name: `questions.${index}.options` as 'questions.0.options',
	});
	const choiceVariant = useWatch({
		control,
		name: `questions.${index}.choiceVariant` as const,
	});
	const isMultiple = choiceVariant === 'multiple';

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
					<div
						role='group'
						aria-label='Тип списка выбора'
						className={styles.toggleGroup}
					>
						{VARIANTS.map((variant) => {
							const active = (field.value ?? 'single') === variant.value;
							return (
								<button
									key={variant.value}
									type='button'
									aria-pressed={active}
									className={styles.toggleBtn}
									data-active={active}
									onClick={() => field.onChange(variant.value)}
								>
									{variant.label}
								</button>
							);
						})}
					</div>
				)}
			/>

			<div className={styles.options}>
				{optionsArray.fields.map((field, optionIndex) => (
					<div key={field.id} className={styles.option}>
						<span
							className={styles.bullet}
							data-multiple={isMultiple || undefined}
							aria-hidden
						/>
						<Input
							aria-label={`Вариант ответа ${optionIndex + 1}`}
							placeholder='Текст варианта'
							{...register(
								`questions.${index}.options.${optionIndex}.label` as const,
							)}
						/>
						<Button
							type='button'
							variant='ghost'
							size='icon-sm'
							aria-label={`Удалить вариант ${optionIndex + 1}`}
							onClick={() => optionsArray.remove(optionIndex)}
						>
							<X size={12} aria-hidden />
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
