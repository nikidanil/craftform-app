import type { Question } from '@/entities/form';
import { ShortTextQuestion } from './ShortTextQuestion';
import { LongTextQuestion } from './LongTextQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';

type Props = { question: Question };

export const FormFillQuestion = ({ question }: Props) => {
	if (question.type === 'short-text') return <ShortTextQuestion question={question} />;
	if (question.type === 'long-text') return <LongTextQuestion question={question} />;
	if (question.type === 'choice') return <ChoiceQuestion question={question} />;
	return null;
};
