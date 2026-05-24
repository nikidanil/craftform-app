import { useId } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	Alert,
	AlertDescription,
	Button,
	Input,
	Label,
} from '@/shared/ui';
import {
	signupSchema,
	type SignupValues,
	useSignupAction,
} from '../model';
import styles from './SignupForm.module.css';

export const SignupForm = () => {
	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const confirmId = useId();
	const firstNameErrorId = `${firstNameId}-error`;
	const lastNameErrorId = `${lastNameId}-error`;
	const emailErrorId = `${emailId}-error`;
	const passwordErrorId = `${passwordId}-error`;
	const confirmErrorId = `${confirmId}-error`;

	const { signup, status, errorMessage } = useSignupAction();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		mode: 'onChange',
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const isPending = status === 'pending';
	const isSubmitDisabled = !isValid || isPending;

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit(signup)}
			noValidate
			aria-busy={isPending || undefined}
		>
			{errorMessage ? (
				<Alert variant='destructive'>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}

			<div className={styles.nameRow}>
				<div className={styles.field}>
					<Label htmlFor={firstNameId}>Имя</Label>
					<Input
						id={firstNameId}
						type='text'
						autoComplete='given-name'
						aria-invalid={errors.firstName ? true : undefined}
						aria-describedby={
							errors.firstName ? firstNameErrorId : undefined
						}
						{...register('firstName')}
					/>
					{errors.firstName ? (
						<p id={firstNameErrorId} className={styles.fieldError}>
							{errors.firstName.message}
						</p>
					) : null}
				</div>
				<div className={styles.field}>
					<Label htmlFor={lastNameId}>Фамилия</Label>
					<Input
						id={lastNameId}
						type='text'
						autoComplete='family-name'
						aria-invalid={errors.lastName ? true : undefined}
						aria-describedby={
							errors.lastName ? lastNameErrorId : undefined
						}
						{...register('lastName')}
					/>
					{errors.lastName ? (
						<p id={lastNameErrorId} className={styles.fieldError}>
							{errors.lastName.message}
						</p>
					) : null}
				</div>
			</div>

			<div className={styles.field}>
				<Label htmlFor={emailId}>Email</Label>
				<Input
					id={emailId}
					type='email'
					autoComplete='email'
					aria-invalid={errors.email ? true : undefined}
					aria-describedby={errors.email ? emailErrorId : undefined}
					{...register('email')}
				/>
				{errors.email ? (
					<p id={emailErrorId} className={styles.fieldError}>
						{errors.email.message}
					</p>
				) : null}
			</div>

			<div className={styles.field}>
				<Label htmlFor={passwordId}>Пароль</Label>
				<Input
					id={passwordId}
					type='password'
					autoComplete='new-password'
					aria-invalid={errors.password ? true : undefined}
					aria-describedby={errors.password ? passwordErrorId : undefined}
					{...register('password')}
				/>
				{errors.password ? (
					<p id={passwordErrorId} className={styles.fieldError}>
						{errors.password.message}
					</p>
				) : null}
			</div>

			<div className={styles.field}>
				<Label htmlFor={confirmId}>Повторите пароль</Label>
				<Input
					id={confirmId}
					type='password'
					autoComplete='new-password'
					aria-invalid={errors.confirmPassword ? true : undefined}
					aria-describedby={
						errors.confirmPassword ? confirmErrorId : undefined
					}
					{...register('confirmPassword')}
				/>
				{errors.confirmPassword ? (
					<p id={confirmErrorId} className={styles.fieldError}>
						{errors.confirmPassword.message}
					</p>
				) : null}
			</div>

			<Button
				type='submit'
				className={styles.submit}
				disabled={isSubmitDisabled}
			>
				Зарегистрироваться
			</Button>
			<p className={styles.altLink}>
				Уже есть аккаунт? <Link to='/login'>Войти</Link>
			</p>
		</form>
	);
};
