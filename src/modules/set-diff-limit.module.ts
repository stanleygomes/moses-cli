import { DEFAULT_MAX_DIFF_CHANGES } from '../constants/ai.constant.js';
import { ConfigUpdateService } from '../services/config-update.service.js';
import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { diffLimitSchema } from '../validators/diff-limit.validator.js';

export class SetDiffLimitModule {
  static async run(): Promise<void> {
    DisplayUtil.banner();

    try {
      const config = await ConfigStore.get();
      const currentLimit = config.ai?.maxDiffChanges;
      const fallback =
        Number.isInteger(currentLimit) && currentLimit! > 0
          ? (currentLimit as number)
          : DEFAULT_MAX_DIFF_CHANGES;

      const limit = await Prompt.ask<number>({
        message: 'Maximum allowed diff changes before interrupting validation:',
        default: String(fallback),
        schema: diffLimitSchema,
      });

      await ConfigUpdateService.updateAiAndSave(config, { maxDiffChanges: limit });
    } catch (error) {
      ErrorUtil.logUnlessNotFound('Could not update diff limit.', error);
    }
  }
}
