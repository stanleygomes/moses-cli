import type { RunAiReviewOptions } from './run-ai-review-options.type.js';

export interface RunAiReviewHandlers {
  options?: RunAiReviewOptions;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  onClose?: (code: number | null) => void;
  onError?: (error: Error) => void;
}
