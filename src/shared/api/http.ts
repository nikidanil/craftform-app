export class HttpError extends Error {
	readonly status: number;
	readonly body: string;

	constructor(status: number, statusText: string, body = '') {
		super(`HTTP ${status} ${statusText}`);
		this.status = status;
		this.body = body;
		this.name = 'HttpError';
	}
}

type HttpInit = Omit<RequestInit, 'body'> & { body?: unknown };

export async function http<T>(url: string, init?: HttpInit): Promise<T> {
	const { body, headers, ...rest } = init ?? {};
	const response = await fetch(url, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => '');
		throw new HttpError(response.status, response.statusText, errorBody);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}
