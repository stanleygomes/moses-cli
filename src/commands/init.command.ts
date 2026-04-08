import { BaseCommand } from './base.command.js';
import { InitModule } from '../modules/init.module.js';

export class InitCommand extends BaseCommand {
  public register(): void {
    this.program
      .command('init')
      .description('Interactive initial setup')
      .action(() => InitModule.run());
  }
}
