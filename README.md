# inVerus

[inVerus.chat](https://inVerus.chat)

**inVerus** is the open-source chat interface for all your models.

![inVerus cover](./public/cover_inVerus.jpg)

## Features

- Multi-model support: OpenAI, Mistral, Claude, Gemini, Ollama (local models)
- Bring your own API key (BYOK) support via OpenRouter
- File uploads
- Clean, responsive UI with light/dark themes
- Built with Tailwind CSS, shadcn/ui, and prompt-kit
- Open-source and self-hostable
- Customizable: user system prompt, multiple layout options
- Local AI with Ollama: Run models locally with automatic model detection
- Full MCP support (wip)

## Quick Start

### Option 1: With OpenAI (Cloud)

```bash
git clone https://github.com/inverus/inVerus.git
cd inVerus
npm install
echo "OPENAI_API_KEY=your-key" > .env.local
npm run dev
```

### Option 2: With Ollama (Local)

```bash
# Install and start Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2  # or any model you prefer

# Clone and run inVerus
git clone https://github.com/inverus/inVerus.git
cd inVerus
npm install
npm run dev
```

inVerus will automatically detect your local Ollama models!

### Option 3: Docker with Ollama

```bash
git clone https://github.com/inverus/inVerus.git
cd inVerus
docker-compose -f docker-compose.ollama.yml up
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/inverus/inVerus)

To unlock features like auth, file uploads, see [INSTALL.md](./INSTALL.md).

## Built with

- [prompt-kit](https://prompt-kit.com/) — AI components
- [shadcn/ui](https://ui.shadcn.com) — core components
- [motion-primitives](https://motion-primitives.com) — animated components
- [vercel ai sdk](https://vercel.com/blog/introducing-the-vercel-ai-sdk) — model integration, AI features
- [supabase](https://supabase.com) — auth and storage

## Sponsors

<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

## License

Apache License 2.0

## Notes

This is a beta release. The codebase is evolving and may change.
