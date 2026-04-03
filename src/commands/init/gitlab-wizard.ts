import axios from 'axios';
import { input, password, select } from '@inquirer/prompts';
import { validateGitlabUrl } from '../../utils/url-parser.js';
import * as display from '../../utils/display.js';
import { validateToken } from '../../services/gitlab.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export interface GitlabSetupData {
  name: string;
  url: string;
  token: string;
}

export async function promptGitlabSetup(
  existingConfig: MosesConfig | null,
): Promise<GitlabSetupData> {
  display.section('📋 GITLAB CONFIGURATION');
  display.info(
    '💡 TIP: Use a nickname to Identify this GitLab config (e.g. "work", "gitlab-org").',
  );
  display.info('   You can run "init" again later to add more instances.');

  const name = await input({
    message: 'Instance nickname (e.g., "work", "gitlab-com" - to identify this GitLab config):',
    default: existingConfig?.defaultGitlab ?? 'gitlab-main',
  });

  const url = await chooseGitlabBaseUrl();
  const settingsBase = url.replace(/\/$/, '');
  display.info(`💡 Create a new Personal Access Token with "api" scope here:`);
  display.link(`${settingsBase}/-/user_settings/personal_access_tokens`);

  let token = '';
  while (true) {
    token = await password({
      message: 'Personal Access Token (scope: api):',
      mask: '*',
    });

    try {
      await validateGitlabToken(url, token);
      break;
    } catch {
      // Just loop back on invalid token
    }
  }

  return { name, url, token };
}

export async function chooseGitlabBaseUrl(): Promise<string> {
  const gitlabType = await select({
    message: 'Which GitLab do you want to use?',
    choices: [
      { name: 'GitLab.com (gitlab.com) — Default', value: 'default' },
      { name: 'Self-Hosted GitLab (provide a custom URL)', value: 'self' },
    ],
  });

  if (gitlabType === 'default') {
    return 'https://gitlab.com';
  }

  while (true) {
    const url = await input({ message: 'GitLab URL:', default: 'https://gitlab.your-domain.com' });
    if (validateGitlabUrl(url)) return url;
    display.error('Invalid URL. Use https:// and a valid domain.');
  }
}

export async function validateGitlabToken(gitlabUrl: string, token: string) {
  const tokenSpinner = display.spinner('Validating token...');
  try {
    const user = await validateToken(gitlabUrl, token);
    tokenSpinner.succeed(`Valid token! User: @${user.username}`);
    return user;
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const message = status ? `Failed (Status ${status})` : 'Invalid or expired token.';
    tokenSpinner.fail(message);
    const settingsBase = gitlabUrl.replace(/\/$/, '');
    display.link(`   ${settingsBase}/-/user_settings/personal_access_tokens`);
    throw error;
  }
}
