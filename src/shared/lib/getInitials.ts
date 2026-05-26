export const getInitials = (firstName: string, lastName: string): string =>
	`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
