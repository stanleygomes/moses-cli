import type { MergeRequestAuthor } from './merge-request-author.type.js';

export interface MergeRequestData {
  iid: number;
  title: string;
  author?: MergeRequestAuthor;
  source_branch: string;
  target_branch: string;
  created_at: string;
  changes_count?: string | number;
  description?: string | null;
}
