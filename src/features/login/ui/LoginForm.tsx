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
import { loginSchema, type LoginValues, useLoginAction } from '../model';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
	const emailId = useId();
	const passwordId = useId();
	const emailErrorId = `${emailId}-error`;
	const passwordErrorId = `${passwordId}-error`;
	const { login, status, errorMessage } = useLoginAction();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
		defaultValues: { email: '', password: '' },
	});

	const isPending = status === 'pending';
	const isSubmitDisabled = !isValid || isPending;

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit(login)}
			noValidate
			aria-busy={isPending || undefined}
		>
			{errorMessage ? (
				<Alert variant='destructive'>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}
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
					autoComplete='current-password'
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
			<Button
				type='submit'
				className={styles.submit}
				disabled={isSubmitDisabled}
			>
				Войти
			</Button>
			<p className={styles.altLink}>
				Нет аккаунта? <Link to='/signup'>Зарегистрироваться</Link>
			</p>
		</form>
	);
};
