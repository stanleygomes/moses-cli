import {
  checkAndFixConfigPermissions,
  getConfigPath,
  readConfig,
} from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export async function loadExistingConfig(): Promise<MosesConfig | null> {
  try {
    const config = await readConfig();
    const permissionStatus = await checkAndFixConfigPermissions();
    if (permissionStatus.fixed) {
      display.warn(`Permissions were automatically fixed to 600 at ${getConfigPath()}`);
    }
    return config;
  } catch {
    return null;
  }
}
