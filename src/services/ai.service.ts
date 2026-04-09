import { spawn } from 'node:child_process';
import { AI_TOOLS, DEFAULT_MAX_DIFF_CHANGES, TOOL_MODELS } from '../constants/ai.constant.js';
import {
  FEEDBACK_STYLE_GUIDANCE,
  TERMINAL_OUTPUT_GUIDELINE,
} from '../constants/feedback.constant.js';
import type { AiToolKey } from '../types/ai-tool-key.type.js';
import type { FeedbackStyle } from '../types/feedback-style.type.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { RunAiReviewHandlers } from '../types/run-ai-review-handlers.type.js';
import { AiToolUtil } from '../utils/ai-tool.util.js';
import type { AiService as AiServiceData } from '../types/ai-service.type.js';
import { DisplayUtil } from '../utils/display.util.js';
import { FeedbackStyleUtil } from '../utils/feedback-style.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { ToolValidator } from '../utils/tool-validator.util.js';
import { aiModelSchema } from '../validators/ai-model.validator.js';
import { diffLimitSchema } from '../validators/diff-limit.validator.js';
import { ContextManager } from './context-manager.service.js';

export class AiService {
  static async promptAiSetup(existingConfig: MosesConfig | null): Promise<AiServiceData> {
    AiService.displayIntro();

    const tool = await AiService.chooseAiTool(existingConfig?.ai?.tool);

    AiService.displayFeedbackStyleTip();
    const feedbackStyle = await AiService.chooseFeedbackStyle(existingConfig?.ai?.feedbackStyle);

    AiService.displayDiffLimitTip();
    const maxDiffChanges = await AiService.chooseMaxDiffChanges(existingConfig?.ai?.maxDiffChanges);

    return { tool, feedbackStyle, maxDiffChanges };
  }

  static async chooseModel(
    tool: AiToolKey,
    currentModel: string | null | undefined,
  ): Promise<string | null> {
    const models = TOOL_MODELS[tool] || [];
    if (models.length === 0) return null;

    const choices = [
      { name: 'Default (let the CLI decide)', value: null },
      ...models,
      { name: 'Other (type manually)', value: 'other' },
    ];

    const selected = await Prompt.select<string | null>({
      message: `Choose the model for ${tool}:`,
      choices,
      default: currentModel === undefined ? null : currentModel,
    });

    if (selected === 'other') {
      return Prompt.ask<string>({
        message: 'Type the model name:',
        schema: aiModelSchema,
      });
    }

    return selected;
  }

  static async chooseSkillsFile(): Promise<string | undefined> {
    const instructionFiles = await ContextManager.getAvailableInstructionFiles();
    if (instructionFiles.length === 0) return undefined;

    return Prompt.select({
      message: 'Which skills file would you like to use for this review?',
      choices: [
        { name: 'None (use repository context only)', value: undefined },
        ...instructionFiles.map((file) => ({ name: file, value: file })),
      ],
    });
  }

  static async chooseAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    while (true) {
      const chosen = await AiService.promptAiTool(existingTool);
      const toolInfo = AiService.findAiToolByKey(chosen);
      const validation = AiService.validateAiToolInstallation(toolInfo);

      if (validation.installed && validation.path) {
        DisplayUtil.success(`${toolInfo.name} found at ${validation.path}`);
        return chosen;
      }

      if (!validation.installed) {
        AiService.displayAiToolInstallInfo(toolInfo, validation.installCmd, validation.installUrl);
      }
      const shouldRetry = await AiService.askRetryToolSelection();
      if (!shouldRetry) {
        throw new Error('AI tool not installed. Install a supported tool and run again.');
      }
    }
  }

  private static displayIntro(): void {
    DisplayUtil.section('🤖 AI TOOL CONFIGURATION');
    DisplayUtil.info(
      '💡 TIP: Moses uses local AI tools to process reviews. Make sure your chosen tool',
    );
    DisplayUtil.info('   is installed and configured with the necessary API keys.');
  }

  private static displayFeedbackStyleTip(): void {
    DisplayUtil.info('\n💡 Feedback Style: Choose how you want the AI to post comments on the MR.');
  }

  private static displayDiffLimitTip(): void {
    DisplayUtil.info('\n💡 Diff Limits: Large files can be slow and expensive (tokens).');
    DisplayUtil.info('   This limit skips files with too many changes.');
  }

  private static async promptAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
    return Prompt.select<AiToolKey>({
      message: 'Choose the AI tool for review:',
      choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
      default: existingTool,
    });
  }

  private static findAiToolByKey(toolKey: AiToolKey) {
    return AiToolUtil.getByKeyOrThrow(toolKey);
  }

  private static validateAiToolInstallation(toolInfo: { key: AiToolKey; name: string }) {
    const toolSpinner = DisplayUtil.spinner(`Checking ${toolInfo.name} installation...`);
    const validation = ToolValidator.validateToolInstallation(toolInfo.key);
    toolSpinner.stop();
    return validation;
  }

  private static displayAiToolInstallInfo(
    toolInfo: { install: string; name: string },
    installCmd: string | undefined,
    installUrl: string,
  ): void {
    DisplayUtil.error(`${toolInfo.name} not found!`);
    DisplayUtil.info(`\n📦 Install with:\n   ${installCmd ?? toolInfo.install}`);
    DisplayUtil.info(`\n📖 Documentation: ${installUrl}\n`);
  }

  private static async askRetryToolSelection(): Promise<boolean> {
    return Prompt.confirm({
      message: 'Do you want to choose another tool?',
      default: true,
    });
  }

  private static async chooseFeedbackStyle(
    existingStyle: FeedbackStyle | undefined,
  ): Promise<FeedbackStyle> {
    return FeedbackStyleUtil.promptSelection(existingStyle);
  }

  private static async chooseMaxDiffChanges(currentLimit: number | undefined): Promise<number> {
    const fallback =
      Number.isInteger(currentLimit) && currentLimit! > 0
        ? (currentLimit as number)
        : DEFAULT_MAX_DIFF_CHANGES;

    return Prompt.ask<number>({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(fallback),
      schema: diffLimitSchema,
    });
  }

  static runAiReview(
    toolKey: AiToolKey,
    markdownContent: string,
    handlers: RunAiReviewHandlers = {},
  ): void {
    const tool = AiToolUtil.getByKeyOrThrow(toolKey);

    const prompt = this.buildPrompt(markdownContent, handlers.options);
    const args = [...tool.args];

    if (handlers.options?.model) {
      args.push('--model', handlers.options.model);
    }

    args.push(prompt);

    const child = spawn(tool.command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => handlers.onStdout?.(chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => handlers.onStderr?.(chunk.toString()));
    child.on('close', (code: number | null) => handlers.onClose?.(code));
    child.on('error', (error: Error) => handlers.onError?.(error));
  }

  private static buildPrompt(
    markdownContent: string,
    options: RunAiReviewHandlers['options'] = {},
  ): string {
    const feedbackStyle = options.feedbackStyle ?? 'pragmatic';
    const toneInstruction =
      FEEDBACK_STYLE_GUIDANCE[feedbackStyle] ?? FEEDBACK_STYLE_GUIDANCE.pragmatic;
    const context = options.contextPrompt?.trim();

    return `${context ? `${context}\n\n` : ''}${TERMINAL_OUTPUT_GUIDELINE}\n\n${toneInstruction}

Merge Request Diff:

${markdownContent}`;
  }
}
