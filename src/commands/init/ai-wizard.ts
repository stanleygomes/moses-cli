import { confirm, input, select } from '@inquirer/prompts';
import { AI_TOOLS, DEFAULT_MAX_DIFF_CHANGES, FEEDBACK_STYLES } from '../../constants.js';
import * as display from '../../utils/display.js';
import { validateToolInstallation } from '../../utils/tool-validator.js';
import type { AiToolKey } from '../../types/AiToolKey.js';
import type { FeedbackStyle } from '../../types/FeedbackStyle.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export interface AiSetupData {
  tool: AiToolKey;
  feedbackStyle: FeedbackStyle;
  maxDiffChanges: number;
}

export async function promptAiSetup(existingConfig: MosesConfig | null): Promise<AiSetupData> {
  display.section('🤖 AI TOOL CONFIGURATION');
  display.info('💡 TIP: Moses uses local AI tools to process reviews. Make sure your chosen tool');
  display.info('   is installed and configured with the necessary API keys.');

  const tool = await chooseAiTool(existingConfig?.ai?.tool);

  display.info('\n💡 Feedback Style: Choose how you want the AI to post comments on the MR.');
  const feedbackStyle = await chooseFeedbackStyle(existingConfig?.ai?.feedbackStyle);

  display.info('\n💡 Diff Limits: Large files can be slow and expensive (tokens).');
  display.info('   This limit skips files with too many changes.');
  const maxDiffChanges = await chooseMaxDiffChanges(existingConfig?.ai?.maxDiffChanges);

  return { tool, feedbackStyle, maxDiffChanges };
}

export async function chooseAiTool(existingTool: AiToolKey | undefined): Promise<AiToolKey> {
  while (true) {
    const chosen = await select({
      message: 'Choose the AI tool for review:',
      choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
      default: existingTool,
    });

    const toolInfo = AI_TOOLS.find((tool) => tool.key === chosen);
    if (!toolInfo) {
      throw new Error(`Unsupported AI tool: ${String(chosen)}`);
    }

    const toolSpinner = display.spinner(`Checking ${toolInfo.name} installation...`);
    const validation = validateToolInstallation(toolInfo.key);
    toolSpinner.stop();

    if (validation.installed) {
      display.success(`${toolInfo.name} found at ${validation.path}`);
      return toolInfo.key;
    }

    display.error(`${toolInfo.name} not found!`);
    display.info(`\n📦 Install with:\n   ${validation.installCmd ?? toolInfo.install}`);
    display.info(`\n📖 Documentation: ${validation.installUrl}\n`);
    const retry = await confirm({ message: 'Do you want to choose another tool?', default: true });
    if (!retry) {
      throw new Error('AI tool not installed. Install a supported tool and run again.');
    }
  }
}

export async function chooseFeedbackStyle(
  existingStyle: FeedbackStyle | undefined,
): Promise<FeedbackStyle> {
  const defaultStyle =
    FEEDBACK_STYLES.find((item) => item.key === existingStyle)?.key ?? FEEDBACK_STYLES[1].key;
  return select({
    message: 'Choose MR feedback style:',
    choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
    default: defaultStyle,
  });
}

export async function chooseMaxDiffChanges(existingLimit: number | undefined): Promise<number> {
  const fallback =
    typeof existingLimit === 'number' && Number.isInteger(existingLimit) && existingLimit > 0
      ? existingLimit
      : DEFAULT_MAX_DIFF_CHANGES;
  while (true) {
    const value = await input({
      message: 'Maximum allowed diff changes before interrupting validation:',
      default: String(fallback),
    });
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
    display.error('Invalid value. Please inform a positive integer.');
  }
}
