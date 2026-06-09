import type { Submission } from './schema';

/**
 * Сводит отклики в карту «id формы → количество откликов».
 * Используется как `select` в `useResponsesCountByForm`, чтобы на списке
 * форм показывать счётчик откликов.
 *
 * Почему здесь, а не в `shared/lib`: функция оперирует доменным полем
 * `Submission.formId` — то есть знает о бизнес-сущности «отклик». Слой
 * `shared` по FSD домен-агностичен и не должен зависеть от entities,
 * поэтому место этого хелпера — в `entities/submission`, рядом со схемой.
 *
 * @param responses — отклики (достаточно поля `formId`)
 * @returns карта `Record<formId, count>`
 */
export const aggregateResponsesByForm = (
	responses: Pick<Submission, 'formId'>[],
): Record<string, number> => {
	const counts: Record<string, number> = {};

	for (const response of responses) {
		counts[response.formId] = (counts[response.formId] ?? 0) + 1;
	}

	return counts;
};
