import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	Alert,
	AlertDescription,
	Button,
	Input,
	Label,
} from '@/shared/ui';
import type { User } from '@/entities/user';
import {
	profileSchema,
	type ProfileValues,
	useEditProfileAction,
} from '../model';
import styles from './ProfileForm.module.css';

type Props = {
	user: User;
};

type Mode = 'view' | 'edit';

export const ProfileForm = ({ user }: Props) => {
	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const firstNameErrorId = `${firstNameId}-error`;
	const lastNameErrorId = `${lastNameId}-error`;
	const emailErrorId = `${emailId}-error`;

	const [mode, setMode] = useState<Mode>('view');
	const { save, status, errorMessage, reset: resetAction } =
		useEditProfileAction();

	const savedValues: ProfileValues = {
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
	};

	const {
		control,
		handleSubmit,
		reset: resetForm,
		formState: { errors, isValid, isDirty },
	} = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		mode: 'onChange',
		defaultValues: savedValues,
	});

	const isReadOnly = mode === 'view';
	const isPending = status === 'pending';

	const onSubmit = async (values: ProfileValues) => {
		const saved = await save(values);
		if (saved) {
			resetForm(values);
			setMode('view');
		}
	};

	const startEditing = () => {
		resetAction();
		setMode('edit');
	};

	const cancelEditing = () => {
		resetForm(savedValues);
		resetAction();
		setMode('view');
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
			<p className={styles.sectionTitle}>Личные данные</p>

			{errorMessage ? (
				<Alert variant='destructive'>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}

			<div className={styles.fieldsGrid}>
				<div className={styles.field}>
					<Label htmlFor={firstNameId} className={styles.fieldLabel}>
						Имя
					</Label>
					<Controller
						control={control}
						name='firstName'
						render={({ field }) => (
							<Input
								{...field}
								id={firstNameId}
								type='text'
								autoComplete='given-name'
								readOnly={isReadOnly}
								aria-invalid={errors.firstName ? true : undefined}
								aria-describedby={
									errors.firstName ? firstNameErrorId : undefined
								}
							/>
						)}
					/>
					{errors.firstName ? (
						<p id={firstNameErrorId} className={styles.fieldError}>
							{errors.firstName.message}
						</p>
					) : null}
				</div>

				<div className={styles.field}>
					<Label htmlFor={lastNameId} className={styles.fieldLabel}>
						Фамилия
					</Label>
					<Controller
						control={control}
						name='lastName'
						render={({ field }) => (
							<Input
								{...field}
								id={lastNameId}
								type='text'
								autoComplete='family-name'
								readOnly={isReadOnly}
								aria-invalid={errors.lastName ? true : undefined}
								aria-describedby={
									errors.lastName ? lastNameErrorId : undefined
								}
							/>
						)}
					/>
					{errors.lastName ? (
						<p id={lastNameErrorId} className={styles.fieldError}>
							{errors.lastName.message}
						</p>
					) : null}
				</div>

				<div className={styles.fieldFull}>
					<Label htmlFor={emailId} className={styles.fieldLabel}>
						Email
					</Label>
					<Controller
						control={control}
						name='email'
						render={({ field }) => (
							<Input
								{...field}
								id={emailId}
								type='email'
								autoComplete='email'
								readOnly={isReadOnly}
								aria-invalid={errors.email ? true : undefined}
								aria-describedby={
									errors.email ? emailErrorId : undefined
								}
							/>
						)}
					/>
					{errors.email ? (
						<p id={emailErrorId} className={styles.fieldError}>
							{errors.email.message}
						</p>
					) : null}
				</div>
			</div>

			<div className={styles.actions}>
				{mode === 'view' ? (
					<Button
						type='button'
						className={styles.actionBtn}
						onClick={startEditing}
					>
						Редактировать
					</Button>
				) : (
					<>
						<Button
							type='button'
							variant='outline'
							className={styles.actionBtn}
							onClick={cancelEditing}
						>
							Отменить
						</Button>
						{isDirty ? (
							<Button
								type='submit'
								className={styles.actionBtn}
								disabled={!isValid || isPending}
							>
								Сохранить
							</Button>
						) : null}
					</>
				)}
			</div>
		</form>
	);
};
