import type { AiToolKey } from './ai-tool-key.type.js';
export interface AiToolDefinition {
  key: AiToolKey;
  name: string;
  command: string;
  args: string[];
  install: string;
  docs: string;
}
