import type { Form } from '@/entities/form';

import { EmptyState } from './EmptyState';
import { FormCard } from './FormCard';
import { NewFormCard } from './NewFormCard';
import styles from './FormsList.module.css';

type Props = {
	forms: Form[];
	responsesCountByForm: Record<string, number>;
};

export const FormsList = ({ forms, responsesCountByForm }: Props) => {
	if (forms.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className={styles.grid}>
			{forms.map((form) => (
				<FormCard
					key={form.id}
					form={form}
					responsesCount={responsesCountByForm[form.id] ?? 0}
				/>
			))}
			<NewFormCard />
		</div>
	);
};
