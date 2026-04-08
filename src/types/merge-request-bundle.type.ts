import type { MergeRequestData } from './merge-request-data.type.js';
import type { MergeRequestDiff } from './merge-request-diff.type.js';
import type { MergeRequestCommit } from './merge-request-commit.type.js';

export interface MergeRequestBundle {
  mr: MergeRequestData;
  diffs: MergeRequestDiff[];
  commits: MergeRequestCommit[];
}
