import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { FeedbackStyleUtil } from '../utils/feedback-style.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { ConfigUpdateService } from '../services/config-update.service.js';

export class SetFeedbackStyleModule {
  static async run(): Promise<void> {
    DisplayUtil.banner();

    try {
      const config = await ConfigStore.get();
      const style = await FeedbackStyleUtil.promptSelection(config.ai?.feedbackStyle);

      await ConfigUpdateService.updateAiAndSave(config, { feedbackStyle: style });
      DisplayUtil.success('Feedback style updated successfully.');
    } catch (error) {
      ErrorUtil.logUnlessNotFound('Could not update feedback style.', error);
    }
  }
}
