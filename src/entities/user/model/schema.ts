import { z } from 'zod';

export const userSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().email(),
});
export type User = z.infer<typeof userSchema>;

export const userRecordSchema = userSchema.extend({
	password: z.string(),
});
export type UserRecord = z.infer<typeof userRecordSchema>;

export const userListSchema = z.array(userSchema);
export const userRecordListSchema = z.array(userRecordSchema);

export const toPublicUser = (record: UserRecord): User => ({
	id: record.id,
	firstName: record.firstName,
	lastName: record.lastName,
	email: record.email,
});
