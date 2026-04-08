import { spawn } from 'node:child_process';
import { AI_TOOLS } from '../constants/ai.constant.js';
import { FEEDBACK_STYLE_GUIDANCE } from '../constants/feedback.constant.js';
import type { RunAiReviewHandlers } from '../types/run-ai-review-handlers.type.js';

export class AiReviewService {
  private static buildPrompt(
    markdownContent: string,
    options: RunAiReviewHandlers['options'] = {},
  ): string {
    const feedbackStyle = options.feedbackStyle ?? 'pragmatic';
    const toneInstruction =
      FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatic;
    const context = options.contextPrompt?.trim();
    return `${context ? `${context}\n\n` : ''}${toneInstruction}

Merge Request Diff:

${markdownContent}`;
  }

  static runAiReview(
    toolKey: string,
    markdownContent: string,
    handlers: RunAiReviewHandlers = {},
  ): void {
    const tool = AI_TOOLS.find((item) => item.key === toolKey);
    if (!tool) {
      throw new Error(`Invalid AI tool: ${toolKey}`);
    }

    const prompt = AiReviewService.buildPrompt(markdownContent, handlers.options);
    const args = [...tool.args, prompt];

    const child = spawn(tool.command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => handlers.onStdout?.(chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => handlers.onStderr?.(chunk.toString()));
    child.on('close', (code: number | null) => handlers.onClose?.(code));
    child.on('error', (error: Error) => handlers.onError?.(error));
  }
}
