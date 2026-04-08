import { MarkdownService } from '../../services/markdown.js';
import { Display } from '../../utils/display.util.js';
import type { MosesConfig } from '../../types/moses-config.type.js';
import type { MergeRequestDiff } from '../../types/merge-request-diff.type.js';

export class DiffLimitChecker {
  static isDiffWithinLimits(diffs: MergeRequestDiff[], config: MosesConfig): boolean {
    const maxDiffChanges = config.ai?.maxDiffChanges;
    const totalChanges = MarkdownService.countDiffChanges(diffs);
    if (Number.isInteger(maxDiffChanges) && maxDiffChanges > 0 && totalChanges > maxDiffChanges) {
      Display.warn(
        `Diff interrupted: total changes (${totalChanges}) exceeds the configured limit (${maxDiffChanges}). Update the limit with: moses set-diff-limit`,
      );
      return false;
    }
    return true;
  }
}
