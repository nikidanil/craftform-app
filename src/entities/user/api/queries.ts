import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { userRecordListSchema, type UserRecord } from '../model';
import { userKeys } from './keys';

export const findUserByEmail = async (
	email: string,
): Promise<UserRecord | null> => {
	const data = await http<unknown>(
		`/api/users?email=${encodeURIComponent(email)}`,
	);
	const records = userRecordListSchema.parse(data);
	return records[0] ?? null;
};

export const useFindUserByEmail = (email: string) =>
	useQuery({
		queryKey: userKeys.byEmail(email),
		queryFn: () => findUserByEmail(email),
		enabled: Boolean(email),
	});
