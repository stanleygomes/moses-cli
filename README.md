<div align="center">

# moses

**moses** is a your CLI to help code review of GitLab Merge Requests using AI tools like GitHub Copilot, Claude, Codex CLI, Gemini CLI.

[![npm version](https://img.shields.io/npm/v/@moses-cli/core.svg)](https://www.npmjs.com/package/@moses-cli/core)
[![Node.js Version](https://img.shields.io/badge/node->=18-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## Installation

📦 Install the npm package

```bash
npm install -g @moses-cli/core
```

## Initial Setup

```bash
moses init
```

The command:

1. Configures GitLab instance (cloud or self-hosted)
2. Validates token via `/api/v4/user` API
3. Selects AI tool
4. Saves config in `~/.config/moses/config.json` with mode `600`

## Usage

You can simply run

```bash
moses validate https://gitlab.your-domain.com/group/project/-/merge_requests/123
```

Flow:

1. Parses MR URL
2. Fetches MR data + diffs + commits from GitLab API
3. Generates markdown in `~/.config/moses/reviews/`
4. Sends content to configured AI tool
5. Displays response in streaming mode on terminal

### Why moses?

Like Moses guiding his people to the promised land, moses validates every merge request, ensuring your most precious asset—your code—reaches production safely.

- ⚡ **Fast analysis**: Fetches diffs directly from GitLab API
- 🤖 **Multi-AI**: Support for 5 leading AI tools
- 🔒 **Secure**: Tokens stored with 600 permissions, never exposed
- 📊 **Comprehensive**: Generates structured markdown with stats, commits, and diffs

## Features

- Interactive setup with token validation
- Support for multiple GitLab instances (gitlab.com + self-hosted)
- Automatic validation of AI tool installation
- Real-time streaming of AI analysis
- Export diffs in Markdown with rich formatting
- Elegant error handling with contextual messages

## For local development

```bash
npm install
npm link
```

## 🤖 Supported AI Tools

| Tool              | CLI          | Installation                              |
| ----------------- | ------------ | ----------------------------------------- |
| GitHub Copilot    | `gh copilot` | `npm install -g @github/copilot`          |
| Claude Code       | `claude`     | `npm install -g @anthropic-ai/claude-cli` |
| Codex CLI         | `chatgpt`    | `npm install -g @openai/codex`            |
| Google Gemini CLI | `gemini`     | `npm install -g @google/gemini-cli`       |

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🔗 Links Úteis

- [Turborepo Docs](https://turborepo.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel](https://vercel.com)

Made with 🔥 by Lumen HQ
