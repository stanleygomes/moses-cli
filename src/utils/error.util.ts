import { DisplayUtil } from './display.util.js';

export class ErrorUtil {
  static getMessage(error: unknown, fallback = 'Unknown error'): string {
    return error instanceof Error ? error.message : fallback;
  }

  static logUnlessNotFound(contextMessage: string, error: unknown): void {
    DisplayUtil.error(contextMessage);

    if (error instanceof Error && (error as { code?: string }).code === 'ENOENT') {
      DisplayUtil.info('Run "moses init" if you haven\'t yet.');
      return;
    }

    console.log(error);
  }
}
