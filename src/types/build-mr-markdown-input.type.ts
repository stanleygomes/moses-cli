import type { MergeRequestBundle } from './merge-request-bundle.type.js';

export interface BuildMergeRequestMarkdownInput {
  mr: MergeRequestBundle['mr'];
  diffs: MergeRequestBundle['diffs'];
  commits: MergeRequestBundle['commits'];
  url: string;
}
