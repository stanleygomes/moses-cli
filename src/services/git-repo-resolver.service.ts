import { UrlParser } from '../utils/url.util.js';
import { ConfigStore } from '../store/config.store.js';
import { DisplayUtil } from '../utils/display.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import { GitUtil } from '../utils/git.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';

export class GitRepoResolver {
  static async resolveRepositoryPath(url: string, config: MosesConfig): Promise<string | null> {
    const targetRepoUrl = GitUtil.getRepoUrlFromMrUrl(url);

    const localRepositoryPath = GitRepoResolver.resolveCurrentDirectoryRepository(targetRepoUrl);
    if (localRepositoryPath) {
      return localRepositoryPath;
    }

    return GitRepoResolver.downloadRepository(url, targetRepoUrl, config);
  }

  private static async downloadRepository(
    url: string,
    targetRepoUrl: string,
    config: MosesConfig,
  ): Promise<string | null> {
    const parsedUrl = UrlParser.parseMergeRequestUrl(url);
    const gitlabConfig = ConfigStore.findGitlabInstance(config, parsedUrl.host);

    if (!gitlabConfig) {
      DisplayUtil.error(`No GitLab instance configured for host: ${parsedUrl.host}`);
      return null;
    }

    return GitRepoResolver.cloneRepositoryWithFeedback(targetRepoUrl, gitlabConfig.token);
  }

  private static resolveCurrentDirectoryRepository(targetRepoUrl: string): string | null {
    if (!GitUtil.isCurrentDirMatchingRepo(targetRepoUrl)) {
      return null;
    }

    DisplayUtil.success('Repository detected in current directory. Using local context.');
    return process.cwd();
  }

  private static async cloneRepositoryWithFeedback(
    targetRepoUrl: string,
    token: string,
  ): Promise<string | null> {
    const spinner = DisplayUtil.spinner('Cloning repository...');
    try {
      const repoPath = await GitUtil.cloneRepository(targetRepoUrl, token);
      spinner.succeed(`Repository cloned to: ${repoPath}`);
      return repoPath;
    } catch (error) {
      spinner.fail('Failed to clone repository.');
      DisplayUtil.error(ErrorUtil.getMessage(error, 'Unknown error during clone.'));
      return null;
    }
  }
}
