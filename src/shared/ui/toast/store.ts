import { create } from 'zustand';

export type ToastVariant = 'default' | 'destructive';

export type Toast = {
	id: string;
	message: string;
	variant: ToastVariant;
};

export const TOAST_DURATION_MS = 4000;

type ToastState = {
	toasts: Toast[];
	addToast: (message: string, variant?: ToastVariant) => string;
	dismissToast: (id: string) => void;
};

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
	toasts: [],
	addToast: (message, variant = 'default') => {
		toastCounter += 1;
		const id = `toast-${toastCounter}`;
		set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
		setTimeout(() => get().dismissToast(id), TOAST_DURATION_MS);
		return id;
	},
	dismissToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((existingToast) => existingToast.id !== id),
		})),
}));

export const toast = {
	success: (message: string) => useToastStore.getState().addToast(message, 'default'),
	error: (message: string) =>
		useToastStore.getState().addToast(message, 'destructive'),
};
