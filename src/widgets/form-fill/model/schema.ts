import { z } from 'zod';
import type { Form, Question } from '@/entities/form';

const REQUIRED_MSG = 'Заполните обязательное поле';

const fieldSchema = (question: Question): z.ZodTypeAny => {
	if (question.type === 'choice' && question.choiceVariant === 'multiple') {
		return question.required
			? z.array(z.string()).min(1, REQUIRED_MSG)
			: z.array(z.string());
	}
	return question.required ? z.string().min(1, REQUIRED_MSG) : z.string();
};

export const buildFormFillSchema = (form: Form): z.ZodObject<Record<string, z.ZodTypeAny>> =>
	z.object(
		Object.fromEntries(
			form.questions.map((question) => [question.id, fieldSchema(question)]),
		),
	);
