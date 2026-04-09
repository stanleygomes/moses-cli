import { MrMarkdownFormatterUtil } from './mr-markdown-formatter.util.js';
import { DisplayUtil } from './display.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { MergeRequestDiff } from '../types/merge-request-diff.type.js';

export class UsageLimitUtil {
  static isDiffWithinLimits(diffs: MergeRequestDiff[], config: MosesConfig): boolean {
    const maxDiffChanges = config.ai?.maxDiffChanges;
    const totalChanges = MrMarkdownFormatterUtil.countDiffChanges(diffs);

    if (Number.isInteger(maxDiffChanges) && maxDiffChanges > 0 && totalChanges > maxDiffChanges) {
      DisplayUtil.warn(
        `Diff interrupted: total changes (${totalChanges}) exceeds the configured limit (${maxDiffChanges}). Update the limit with: moses set-diff-limit`,
      );

      return false;
    }

    return true;
  }
}
