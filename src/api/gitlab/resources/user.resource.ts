import { HttpUtil } from '../../../utils/http.util.js';
import type { GitlabUser } from '../../../types/gitlab-user.type.js';

export class UserResource {
  constructor(private readonly client: HttpUtil) {}

  async getCurrentUser(): Promise<GitlabUser> {
    return this.client.get<GitlabUser>('/api/v4/user');
  }
}
