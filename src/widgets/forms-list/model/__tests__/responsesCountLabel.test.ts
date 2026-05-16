import { describe, expect, it } from 'vitest';
import { responsesCountLabel } from '../responsesCountLabel';

describe('responsesCountLabel', () => {
	it.each([
		[0, '0 откликов'],
		[1, '1 отклик'],
		[2, '2 отклика'],
		[3, '3 отклика'],
		[4, '4 отклика'],
		[5, '5 откликов'],
		[11, '11 откликов'],
		[12, '12 откликов'],
		[14, '14 откликов'],
		[21, '21 отклик'],
		[22, '22 отклика'],
		[25, '25 откликов'],
		[111, '111 откликов'],
	])('возвращает для %i → "%s"', (count, expected) => {
		expect(responsesCountLabel(count)).toBe(expected);
	});
});
