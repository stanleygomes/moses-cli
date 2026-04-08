import type { ValidateOptions } from '../types/validate-options.type.js';
import { BaseCommand } from './base.command.js';
import { ValidateModule } from '../modules/validate-module/validate.module.js';

export class ValidateCommand extends BaseCommand {
  public register(): void {
    this.program
      .command('validate')
      .description('Validate a GitLab Merge Request with an AI tool')
      .argument('<url>', 'GitLab Merge Request URL')
      .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
      .action((url: string, options: ValidateOptions) => ValidateModule.run(url, options));
  }
}
