import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { GitlabInstanceManager } from '../services/gitlab-instance-manager.service.js';
import { ErrorUtil } from '../utils/error.util.js';

export class GitlabListModule {
  static async run(): Promise<void> {
    DisplayUtil.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabInstanceManager.displayNoInstances();
        return;
      }

      GitlabInstanceManager.displayInstances(config);
    } catch (error) {
      ErrorUtil.logUnlessNotFound('Could not load Moses configuration.', error);
    }
  }
}
