import type { AiToolKey } from './ai-tool-key.type.js';
import type { FeedbackStyle } from './feedback-style.type.js';

export interface AiService {
  tool: AiToolKey;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}
