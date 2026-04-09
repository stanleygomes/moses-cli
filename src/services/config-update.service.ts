import { ConfigStore } from '../store/config.store.js';
import type { AiConfig } from '../types/ai-config.type.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class ConfigUpdateService {
  static async updateAndSave(
    config: MosesConfig,
    updater: (current: MosesConfig) => MosesConfig,
  ): Promise<MosesConfig> {
    const nextConfig = updater(config);
    await ConfigStore.set(nextConfig);
    return nextConfig;
  }

  static async updateAiAndSave(
    config: MosesConfig,
    updates: Partial<AiConfig>,
  ): Promise<MosesConfig> {
    return ConfigUpdateService.updateAndSave(config, (current) => ({
      ...current,
      ai: {
        ...current.ai,
        ...updates,
      },
    }));
  }

  static async updateDefaultGitlab(config: MosesConfig, nextDefault: string): Promise<MosesConfig> {
    return ConfigUpdateService.updateAndSave(config, (current) => ({
      ...current,
      defaultGitlab: nextDefault,
      gitlabs: current.gitlabs.map((gitlab) => ({
        ...gitlab,
        default: gitlab.name === nextDefault,
      })),
    }));
  }
}
