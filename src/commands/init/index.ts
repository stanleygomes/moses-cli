import { confirm } from '@inquirer/prompts';
import { MESSAGES } from '../../constants.js';
import * as display from '../../utils/display.js';
import { loadExistingConfig } from './config-loader.js';
import { promptGitlabSetup } from './gitlab-wizard.js';
import { promptAiSetup } from './ai-wizard.js';
import { buildAndSaveConfig } from './config-builder.js';

export async function runInit(): Promise<void> {
  display.banner();
  display.info(MESSAGES.welcome);

  const existingConfig = await loadExistingConfig();
  if (existingConfig) {
    const overwrite = await confirm({
      message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
      default: true,
    });
    if (!overwrite) {
      display.info('No changes applied.');
      return;
    }
  }

  const gitlabData = await promptGitlabSetup(existingConfig);
  const aiData = await promptAiSetup(existingConfig);

  const configPath = await buildAndSaveConfig(gitlabData, aiData, existingConfig);

  display.success(MESSAGES.done);
  display.info(`📁 Config saved at ${configPath} (mode 600)`);
  display.info(MESSAGES.next);
}
