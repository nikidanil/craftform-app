import { describe, expect, it } from 'vitest';
import { aggregateResponsesByForm } from '../aggregateResponsesByForm';

describe('aggregateResponsesByForm', () => {
	it('возвращает пустой объект для пустого списка откликов', () => {
		expect(aggregateResponsesByForm([])).toEqual({});
	});

	it('считает один отклик на одну форму', () => {
		expect(aggregateResponsesByForm([{ formId: 'form-1' }])).toEqual({
			'form-1': 1,
		});
	});

	it('группирует отклики по formId и считает количество', () => {
		const responses = [
			{ formId: 'form-1' },
			{ formId: 'form-1' },
			{ formId: 'form-2' },
		];

		expect(aggregateResponsesByForm(responses)).toEqual({
			'form-1': 2,
			'form-2': 1,
		});
	});
});
