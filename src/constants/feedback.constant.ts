import type { FeedbackStyle } from '../types/feedback-style.type.js';

export const FEEDBACK_STYLES = [
  { key: 'friendly', label: 'Friendly' },
  { key: 'pragmatic', label: 'Pragmatic' },
  { key: 'offensive', label: 'Ruthless (Brutally honest)' },
] as const;

export const FEEDBACK_STYLE_GUIDANCE: Record<FeedbackStyle, string> = {
  friendly: 'Use a friendly, respectful, and constructive tone.',
  pragmatic: 'Use a pragmatic, direct, and objective tone.',
  offensive:
    'Be a extremely harsh, blunt and ruthless code reviewer. Use a cynical and critical tone. If the code is bad, say it is "garbage", "trash" or "disposable". Do not sugarcoat anything. You are NOT allowed to insult the person/author, but you MUST be savage when reviewing the code quality.',
};
