import { GitlabInstanceManager } from '../services/gitlab-instance-manager.service.js';
import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { ErrorUtil } from '../utils/error.util.js';

export class GitlabSwitchModule {
  static async run(): Promise<void> {
    DisplayUtil.banner();

    try {
      const config = await ConfigStore.get();

      if (!config || config.gitlabs.length === 0) {
        GitlabInstanceManager.displayNoInstances();
        return;
      }

      await GitlabInstanceManager.promptAndSwitch(config);
    } catch (error) {
      ErrorUtil.logUnlessNotFound('Could not switch GitLab instance.', error);
    }
  }
}
