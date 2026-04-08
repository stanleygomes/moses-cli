import { AiReviewService } from './ai-review.service.js';
import { ContextManager } from './context-manager.service.js';
import { RepoScanner } from './repo-scanner.service.js';
import { MrMarkdownFormatter } from './mr-markdown-formatter.service.js';
import { Display } from '../utils/display.util.js';
import { ErrorUtil } from '../utils/error.util.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { ValidateOptions } from '../types/validate-options.type.js';
import type { MergeRequestBundle } from '../types/merge-request-bundle.type.js';

export class ReviewOrchestrator {
  static async runReviewTask(
    url: string,
    data: MergeRequestBundle,
    config: MosesConfig,
    options: ValidateOptions,
    repoPath: string | null = null,
  ): Promise<void> {
    const markdownSpinner = Display.spinner('Preparing context and diff...');
    try {
      const {
        prompt: contextPrompt,
        localFiles,
        repoFiles,
      } = await ReviewOrchestrator.buildContextPrompt(options.prompt ?? '', repoPath);
      const markdown = ReviewOrchestrator.buildReviewMarkdown(url, data);

      const localInfo = localFiles.length > 0 ? `${localFiles.length} local` : 'no local';
      const repoInfo = repoFiles.length > 0 ? `${repoFiles.join(', ')}` : 'no repository';

      markdownSpinner.succeed(
        `Context and diff prepared (files: ${localInfo}, repository: ${repoInfo})`,
      );

      if (repoPath && repoFiles.length === 0) {
        Display.warn(
          'No specific context files found in repository (e.g. copilot-instructions.md, README.md)',
        );
      }

      await ReviewOrchestrator.executeAiReview(config, markdown, contextPrompt);
    } catch (error: unknown) {
      markdownSpinner.fail('Failed to generate markdown or run AI review.');
      Display.error(ErrorUtil.getMessage(error, 'Unknown error during AI review.'));
    }
  }

  private static async buildContextPrompt(
    extraPrompt: string,
    repoPath: string | null,
  ): Promise<{ prompt: string; localFiles: string[]; repoFiles: string[] }> {
    await ContextManager.ensureDefaultContextFiles();
    const { prompt: baseContext, files: localFiles } =
      await ContextManager.readContextPrompt(extraPrompt);
    const { prompt, repoFiles } = await ReviewOrchestrator.appendRepoContext(baseContext, repoPath);

    return { prompt, localFiles, repoFiles };
  }

  private static async appendRepoContext(
    baseContext: string,
    repoPath: string | null,
  ): Promise<{ prompt: string; repoFiles: string[] }> {
    if (!repoPath) {
      return { prompt: baseContext, repoFiles: [] };
    }

    const { content, files } = await RepoScanner.scanRepoForContext(repoPath);

    return {
      prompt: content ? `${baseContext}\n${content}` : baseContext,
      repoFiles: files,
    };
  }

  private static buildReviewMarkdown(url: string, data: MergeRequestBundle): string {
    return MrMarkdownFormatter.buildMergeRequestMarkdown({
      mr: data.mr,
      diffs: data.diffs,
      commits: data.commits,
      url,
    });
  }

  private static async executeAiReview(
    config: MosesConfig,
    markdown: string,
    contextPrompt: string,
  ): Promise<void> {
    const reviewSpinner = Display.spinner('Connecting to AI tool...');
    Display.info('\n🤖 Starting review with AI tool...');
    Display.info('────────────────────────────────────────────────────────');

    await new Promise<void>((resolve, reject) => {
      let firstChunk = true;
      const stopSpinnerOnStart = () => {
        if (firstChunk) {
          reviewSpinner.stop();
          firstChunk = false;
        }
      };

      AiReviewService.runAiReview(config.ai?.tool ?? 'copilot', markdown, {
        options: {
          feedbackStyle: config.ai?.feedbackStyle,
          contextPrompt,
        },
        onStdout: (chunk: string) => {
          stopSpinnerOnStart();
          Display.stream(chunk);
        },
        onStderr: (chunk: string) => {
          stopSpinnerOnStart();
          Display.stream(chunk);
        },
        onClose: (code: number | null) => {
          if (code === 0) {
            Display.info('\n────────────────────────────────────────────────────────');
            Display.success('Analysis completed');
            resolve();
          } else {
            reviewSpinner.fail('AI analysis failed');
            reject(new Error(`AI process exited with code ${String(code)}`));
          }
        },
        onError: (error: Error) => {
          reviewSpinner.fail('AI analysis failed');
          reject(error);
        },
      });
    });
  }
}
