import { Check, CircleAlert, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { BuilderNotice as Notice, NoticeTone } from '../model/useBuilderNotice';
import styles from './BuilderNotice.module.css';

type Props = {
	notice: Notice;
};

const ICON_BY_TONE = {
	pending: Loader2,
	success: Check,
	error: CircleAlert,
	info: CircleAlert,
} as const;

const TONE_CLASS: Record<NoticeTone, string> = {
	pending: styles.pending,
	success: styles.success,
	error: styles.error,
	info: styles.info,
};

export const BuilderNotice = ({ notice }: Props) => {
	if (!notice) return null;

	const Icon = ICON_BY_TONE[notice.tone];

	return (
		<p
			className={cn(styles.notice, TONE_CLASS[notice.tone])}
			role={notice.tone === 'error' ? 'alert' : 'status'}
		>
			<Icon
				size={16}
				strokeWidth={2.5}
				aria-hidden
				className={cn(
					styles.icon,
					notice.tone === 'pending' &&
						'animate-spin motion-reduce:animate-none',
				)}
			/>
			{notice.text}
		</p>
	);
};
