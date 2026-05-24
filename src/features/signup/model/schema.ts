import { z } from 'zod';

export const signupSchema = z
	.object({
		firstName: z.string().min(1, 'Введите имя'),
		lastName: z.string().min(1, 'Введите фамилию'),
		email: z.string().email('Введите корректный email'),
		password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
		confirmPassword: z.string(),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Пароли не совпадают',
	});

export type SignupValues = z.infer<typeof signupSchema>;
