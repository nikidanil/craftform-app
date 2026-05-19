import { z } from 'zod';
import type { Form, Question } from '@/entities/form';

const REQUIRED_MSG = 'Заполните обязательное поле';

const fieldSchema = (q: Question): z.ZodTypeAny => {
	if (q.type === 'choice' && q.choiceVariant === 'multiple') {
		return q.required
			? z.array(z.string()).min(1, REQUIRED_MSG)
			: z.array(z.string());
	}
	return q.required ? z.string().min(1, REQUIRED_MSG) : z.string();
};

export const buildFormFillSchema = (form: Form): z.ZodObject<Record<string, z.ZodTypeAny>> =>
	z.object(Object.fromEntries(form.questions.map((q) => [q.id, fieldSchema(q)])));
