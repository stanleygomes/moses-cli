import { ContextManager } from '../services/context-manager.service.js';
import { FsUtil } from '../utils/fs.util.js';
import { DisplayUtil } from '../utils/display.util.js';
import chalk from 'chalk';

export class OpenSkillsModule {
  static async run(): Promise<void> {
    const skillsDir = ContextManager.getSkillsDir();

    await FsUtil.ensureDir(skillsDir);

    DisplayUtil.info(`Opening user skills folder: ${chalk.cyan(skillsDir)}`);

    try {
      await FsUtil.openFolder(skillsDir);
    } catch {
      DisplayUtil.warn('Could not open folder automatically.');
      DisplayUtil.info(`Please open it manually at: ${chalk.bold(skillsDir)}`);
    }
  }
}
