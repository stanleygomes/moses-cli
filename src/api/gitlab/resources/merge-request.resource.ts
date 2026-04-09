import { HttpUtil } from '../../../utils/http.util.js';
import type { MergeRequestBundle } from '../../../types/merge-request-bundle.type.js';

export class MergeRequestResource {
  constructor(private readonly client: HttpUtil) {}

  private getBasePath(projectId: string, mrIid: string): string {
    return `/api/v4/projects/${projectId}/merge_requests/${mrIid}`;
  }

  async getById(projectId: string, mrIid: string): Promise<MergeRequestBundle['mr']> {
    return this.client.get<MergeRequestBundle['mr']>(this.getBasePath(projectId, mrIid));
  }

  async getDiffs(projectId: string, mrIid: string): Promise<MergeRequestBundle['diffs']> {
    return this.client.get<MergeRequestBundle['diffs']>(
      `${this.getBasePath(projectId, mrIid)}/diffs`,
    );
  }

  async getCommits(projectId: string, mrIid: string): Promise<MergeRequestBundle['commits']> {
    return this.client.get<MergeRequestBundle['commits']>(
      `${this.getBasePath(projectId, mrIid)}/commits`,
    );
  }

  async getBundle(projectId: string, mrIid: string): Promise<MergeRequestBundle> {
    const [mr, diffs, commits] = await Promise.all([
      this.getById(projectId, mrIid),
      this.getDiffs(projectId, mrIid),
      this.getCommits(projectId, mrIid),
    ]);

    return { mr, diffs, commits };
  }
}
