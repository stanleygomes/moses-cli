import { ConfigStore } from '../store/config.store.js';
import { Display } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';

export class ResetConfigModule {
  static async run(): Promise<void> {
    Display.banner();

    const confirmed = await Prompt.confirm({
      message: 'Are you sure you want to delete all local configurations?',
      default: false,
    });

    if (!confirmed) {
      Display.info('Reset cancelled.');
      return;
    }

    try {
      await ConfigStore.delete();
      Display.success('Local configuration has been successfully deleted.');
    } catch (error) {
      if (error instanceof Error && (error as { code?: string }).code === 'ENOENT') {
        Display.warn('No configuration file found to delete.');
      } else {
        Display.error('Failed to delete configuration file.');
        console.error(error);
      }
    }
  }
}
