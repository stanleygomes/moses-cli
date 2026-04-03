import { select } from '@inquirer/prompts';
import { readConfig, saveConfig } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export async function runSwitchGitlab(): Promise<void> {
  display.banner();

  try {
    const config = await readConfig();

    if (!config || config.gitlabs.length === 0) {
      display.warn('No GitLab instances configured.');
      return;
    }

    const choices = config.gitlabs.map((gitlab) => ({
      name: `${gitlab.name} (${gitlab.url})`,
      value: gitlab.name,
    }));

    const nextDefault = await select({
      message: 'Choose the default GitLab instance:',
      choices,
      default: config.defaultGitlab,
    });

    const updatedGitlabs = config.gitlabs.map((gitlab) => ({
      ...gitlab,
      default: gitlab.name === nextDefault,
    }));

    const nextConfig: MosesConfig = {
      ...config,
      defaultGitlab: nextDefault,
      gitlabs: updatedGitlabs,
    };

    await saveConfig(nextConfig);
    display.success(`Default GitLab switched to: ${nextDefault}`);
  } catch (error) {
    display.error('Could not switch GitLab instance.');
    console.log(error);
  }
}
