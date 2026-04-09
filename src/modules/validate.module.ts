import { MESSAGES } from '../constants/messages.constant.js';
import { GitRepoResolver } from '../services/git-repo-resolver.service.js';
import { GitlabDataProvider } from '../services/gitlab-data-provider.service.js';
import { ReviewOrchestrator } from '../services/review-orchestrator.service.js';
import { ConfigStore } from '../store/config.store.js';
import type { ValidateOptions } from '../types/validate-options.type.js';
import { DisplayUtil } from '../utils/display.util.js';
import { UsageLimitUtil } from '../utils/usage-limit.util.js';
import { ContextManager } from '../services/context-manager.service.js';
import { Prompt } from '../utils/prompt.util.js';

export class ValidateModule {
  static async run(url: string, options: ValidateOptions = {}): Promise<void> {
    DisplayUtil.banner();

    const config = await ConfigStore.getSafe();

    if (!config) {
      DisplayUtil.error(MESSAGES.noConfig);
      return;
    }

    const data = await GitlabDataProvider.fetchMrData(url, config);
    if (!data) return;

    if (!UsageLimitUtil.isDiffWithinLimits(data.diffs, config)) return;

    const repoPath = await GitRepoResolver.resolveRepositoryPath(url, config);

    const instructionFiles = await ContextManager.getAvailableInstructionFiles();
    if (!options.instructionFile && instructionFiles.length > 0) {
      options.instructionFile = await Prompt.select({
        message: 'Which skills file would you like to use for this review?',
        choices: [
          { name: 'None (use repository context only)', value: undefined },
          ...instructionFiles.map((file) => ({ name: file, value: file })),
        ],
      });
    }

    await ReviewOrchestrator.runReviewTask(url, data, config, options, repoPath);
  }
}
