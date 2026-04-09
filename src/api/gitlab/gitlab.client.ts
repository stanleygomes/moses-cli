import { HttpUtil } from '../../utils/http.util.js';
import { UserResource } from './resources/user.resource.js';
import { MergeRequestResource } from './resources/merge-request.resource.js';

export class GitlabClient {
  private readonly client: HttpUtil;

  public readonly users: UserResource;
  public readonly mergeRequests: MergeRequestResource;

  constructor(baseURL: string, token: string) {
    this.client = new HttpUtil({
      baseURL,
      headers: {
        'PRIVATE-TOKEN': token,
      },
    });

    this.users = new UserResource(this.client);
    this.mergeRequests = new MergeRequestResource(this.client);
  }
}
