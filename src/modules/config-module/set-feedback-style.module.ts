import { select } from '@inquirer/prompts';
import { FEEDBACK_STYLES } from '../../constants/feedback.constant.js';
import { ConfigStore } from '../../utils/config-store.util.js';
import { Display } from '../../utils/display.util.js';
import type { FeedbackStyle } from '../../types/feedback-style.type.js';
import type { MosesConfig } from '../../types/moses-config.type.js';
import { UpdateConfigLoaderModule } from './load-config.module.js';

export class SetFeedbackStyleModule {
  static async run(): Promise<void> {
    Display.banner();
    const config = await UpdateConfigLoaderModule.loadConfigOrExit();
    if (!config) return;

    const current = config.ai?.feedbackStyle;
    const style: FeedbackStyle = await select({
      message: 'Choose MR feedback style:',
      choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
      default: FEEDBACK_STYLES.find((item) => item.key === current)?.key ?? FEEDBACK_STYLES[1].key,
    });

    const nextConfig: MosesConfig = {
      ...config,
      ai: {
        ...config.ai,
        feedbackStyle: style,
      },
    };

    await ConfigStore.saveConfig(nextConfig);
    Display.success('Feedback style updated successfully.');
  }
}
