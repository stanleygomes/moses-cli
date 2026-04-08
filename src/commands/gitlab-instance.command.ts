import { GitlabListModule } from '../modules/gitlab-module/list.module.js';
import { GitlabSwitchModule } from '../modules/gitlab-module/switch.module.js';
import { BaseCommand } from './base.command.js';

export class GitlabInstanceCommand extends BaseCommand {
  public register(): void {
    const gitlab = this.program.command('gitlab').description('Manage GitLab instances');

    gitlab
      .command('list')
      .description('List all configured GitLab instances')
      .action(() => GitlabListModule.run());

    gitlab
      .command('default')
      .description('Change the default GitLab instance')
      .action(() => GitlabSwitchModule.run());
  }
}
