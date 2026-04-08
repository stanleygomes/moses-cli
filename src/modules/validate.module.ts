import { Display } from '../utils/display.util.js';
import { ValidateGitlabDataProvider } from '../services/fetch-mr-data.js';
import { DiffLimitChecker } from '../services/check-limits.js';
import { ValidateReviewRunner } from '../services/review.js';
import { ValidateConfigHandler } from '../services/validate-config.handler.js';
import { RepositoryResolverHandler } from '../services/repository-resolver.handler.js';
import type { ValidateOptions } from '../types/validate-options.type.js';

export class ValidateModule {
  static async run(url: string, options: ValidateOptions = {}): Promise<void> {
    Display.banner();
    Display.info(`🔗 Analyzing: ${url}`);

    const config = await ValidateConfigHandler.getConfig();
    if (!config) return;

    const data = await ValidateGitlabDataProvider.fetchMrData(url, config);
    if (!data) return;

    if (!DiffLimitChecker.isDiffWithinLimits(data.diffs, config)) return;

    const repoPath = await RepositoryResolverHandler.resolveRepositoryPath(url, config);

    await ValidateReviewRunner.runReviewTask(url, data, config, options, repoPath);
  }
}
