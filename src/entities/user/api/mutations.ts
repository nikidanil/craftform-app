import { http } from '@/shared/api';
import {
	toPublicUser,
	userRecordSchema,
	type User,
	type UserRecord,
} from '../model';

export type CreateUserInput = Omit<UserRecord, 'id'>;

export const createUser = async (input: CreateUserInput): Promise<User> => {
	const payload: UserRecord = {
		...input,
		id: crypto.randomUUID(),
	};
	const data = await http<unknown>('/api/users', {
		method: 'POST',
		body: payload,
	});
	const record = userRecordSchema.parse(data);
	return toPublicUser(record);
};

export type UpdateUserInput = {
	id: string;
	patch: Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email'>>;
};

export const updateUser = async ({
	id,
	patch,
}: UpdateUserInput): Promise<User> => {
	const data = await http<unknown>(`/api/users/${id}`, {
		method: 'PATCH',
		body: patch,
	});
	const record = userRecordSchema.parse(data);
	return toPublicUser(record);
};
