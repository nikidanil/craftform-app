import { vi } from 'vitest';

type ObserverHandle = {
	target: Element | null;
	trigger: () => void;
};

export const createdObservers: ObserverHandle[] = [];

class MockIntersectionObserver {
	private readonly handle: ObserverHandle;

	constructor(callback: IntersectionObserverCallback) {
		this.handle = {
			target: null,
			trigger: () => {
				const entry = {
					isIntersecting: true,
					target: this.handle.target ?? document.createElement('div'),
				} as IntersectionObserverEntry;
				// мок не реализует полный интерфейс IntersectionObserver
				callback([entry], this as unknown as IntersectionObserver);
			},
		};
		createdObservers.push(this.handle);
	}

	observe(target: Element) {
		this.handle.target = target;
	}

	unobserve() {}

	disconnect() {
		this.handle.target = null;
	}

	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

export const stubIntersectionObserver = () => {
	createdObservers.length = 0;
	vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
};

export const unstubIntersectionObserver = () => {
	vi.unstubAllGlobals();
};

export const triggerLastObserver = () => {
	createdObservers.at(-1)?.trigger();
};
