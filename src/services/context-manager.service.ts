import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SKILLS_DIR } from '../constants/paths.constant.js';
import { FsUtil } from '../utils/fs.util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '../prompts');

export class ContextManager {
  static getSkillsDir(): string {
    return FsUtil.resolveHome(DEFAULT_SKILLS_DIR);
  }

  static async ensureDefaultSkillsFiles(): Promise<{
    contextDir: string;
    files: string[];
  }> {
    const contextDir = ContextManager.getSkillsDir();
    await ContextManager.ensureContextDirectory(contextDir);
    const files = await ContextManager.listPromptFiles();
    await ContextManager.copyMissingPromptFiles(files, contextDir);
    return { contextDir, files };
  }

  static async readContextPrompt(
    extraPrompt = '',
    specificFile?: string,
  ): Promise<{ prompt: string; files: string[] }> {
    const contextDir = ContextManager.getSkillsDir();
    let mdFiles: string[] = [];

    if (specificFile) {
      mdFiles = [specificFile];
    } else {
      mdFiles = await ContextManager.listMarkdownFiles(contextDir);
    }

    const segments = await ContextManager.readTrimmedContents(contextDir, mdFiles);
    const prompt = ContextManager.buildContextPrompt(segments, extraPrompt);
    return { prompt, files: mdFiles };
  }

  static async getAvailableInstructionFiles(): Promise<string[]> {
    const contextDir = ContextManager.getSkillsDir();
    try {
      return await ContextManager.listMarkdownFiles(contextDir);
    } catch {
      return [];
    }
  }

  private static async ensureContextDirectory(contextDir: string): Promise<void> {
    await fs.mkdir(contextDir, { recursive: true });
  }

  private static async listPromptFiles(): Promise<string[]> {
    return fs.readdir(PROMPTS_DIR);
  }

  private static async copyMissingPromptFiles(files: string[], contextDir: string): Promise<void> {
    for (const file of files) {
      await ContextManager.copyPromptFileIfMissing(file, contextDir);
    }
  }

  private static async copyPromptFileIfMissing(file: string, contextDir: string): Promise<void> {
    const srcPath = path.join(PROMPTS_DIR, file);
    const destPath = path.join(contextDir, file);

    try {
      await fs.access(destPath);
    } catch {
      await fs.copyFile(srcPath, destPath);
    }
  }

  private static async listMarkdownFiles(contextDir: string): Promise<string[]> {
    const files = await fs.readdir(contextDir);
    return files.filter((file) => file.endsWith('.md')).sort();
  }

  private static async readTrimmedContents(contextDir: string, files: string[]): Promise<string[]> {
    const contents = await Promise.all(
      files.map((file) => fs.readFile(path.join(contextDir, file), 'utf-8')),
    );
    return contents.map((content) => content.trim());
  }

  private static buildContextPrompt(segments: string[], extraPrompt: string): string {
    if (extraPrompt.trim()) {
      segments.push(`# Additional user context\n${extraPrompt.trim()}`);
    }
    return `${segments.join('\n\n')}\n`;
  }
}
