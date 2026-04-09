import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';

export class ResetConfigModule {
  static async run(): Promise<void> {
    DisplayUtil.banner();

    const confirmed = await Prompt.confirm({
      message: 'Are you sure you want to delete all local configurations?',
      default: false,
    });

    if (!confirmed) {
      DisplayUtil.info('Reset cancelled.');
      return;
    }

    try {
      await ConfigStore.delete();
      DisplayUtil.success('Local configuration has been successfully deleted.');
    } catch (error) {
      if (error instanceof Error && (error as { code?: string }).code === 'ENOENT') {
        DisplayUtil.warn('No configuration file found to delete.');
      } else {
        DisplayUtil.error('Failed to delete configuration file.');
        console.error(error);
      }
    }
  }
}
