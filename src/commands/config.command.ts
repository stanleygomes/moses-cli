import { BaseCommand } from './base.command.js';
import { SetFeedbackStyleModule } from '../modules/set-feedback-style.module.js';
import { SetDiffLimitModule } from '../modules/set-diff-limit.module.js';
import { ResetConfigModule } from '../modules/reset-config.module.js';

export class ConfigCommand extends BaseCommand {
  public register(): void {
    const config = this.program.command('config').description('Manage Moses configuration');

    config
      .command('feedback-style')
      .description('Update AI feedback style on Merge Requests')
      .action(() => SetFeedbackStyleModule.run());

    config
      .command('diff-limit')
      .description('Update maximum allowed diff changes limit')
      .action(() => SetDiffLimitModule.run());

    config
      .command('reset')
      .description('Clear all local configurations')
      .action(() => ResetConfigModule.run());
  }
}
