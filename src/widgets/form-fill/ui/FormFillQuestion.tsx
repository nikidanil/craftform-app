import {
	isChoiceQuestion,
	isLongTextQuestion,
	isShortTextQuestion,
	type Question,
} from '@/entities/form';
import { ShortTextQuestion } from './ShortTextQuestion';
import { LongTextQuestion } from './LongTextQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';

type Props = { question: Question };

export const FormFillQuestion = ({ question }: Props) => {
	if (isShortTextQuestion(question)) return <ShortTextQuestion question={question} />;
	if (isLongTextQuestion(question)) return <LongTextQuestion question={question} />;
	if (isChoiceQuestion(question)) return <ChoiceQuestion question={question} />;
	return null;
};
