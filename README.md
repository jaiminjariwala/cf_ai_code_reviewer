# cf_ai_code-reviewer

An AI-powered code review assistant built on Cloudflare's platform. Paste your code, get instant feedback on bugs, improvements, and best practices.

## Features

- 🔍 Intelligent code analysis using Llama 3.3
- 💬 Natural language conversation about your code
- 🧠 Remembers your preferences and conversation history
- 🎯 Personalized feedback based on your coding style
- ⚡ Fast responses powered by Cloudflare Workers AI

## Architecture

- **LLM**: Llama 3.3 on Workers AI
- **Backend**: Cloudflare Workers
- **State Management**: Durable Objects
- **Frontend**: Cloudflare Pages
- **Framework**: Hono (lightweight web framework)

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cf_ai_code-review-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npx wrangler dev --local
```

4. Open browser at `http://localhost:8787`

## Deployment

1. Login to Cloudflare:
```bash
npx wrangler login
```

2. Deploy:
```bash
npm run deploy
```
You'll be given a link, click on it to view the website.

## Usage

1. **Paste Code**: Copy your code into the text area
2. **Optional Message**: Ask a specific question about the code
3. **Click Review**: Get AI-powered analysis
4. **Follow Up**: Ask clarifying questions in the conversation
5. **Adjust Preferences**: Change language and feedback style

## Project Structure

```
cf_ai_code-review-buddy/
├── src/
│   ├── index.ts          # Main Worker with API endpoints
│   ├── durableObject.ts  # Session state management
│   └── prompts.ts        # AI prompt templates
├── public/
│   ├── index.html        # Chat interface
│   ├── style.css         # Styling
│   └── app.js            # Frontend logic
├── wrangler.toml         # Cloudflare configuration
├── README.md             # This file
├── PROMPTS.md            # AI prompts documentation
└── package.json
```

## Technologies Used

- Cloudflare Workers AI (Llama 3.3)
- Cloudflare Workers
- Durable Objects
- Cloudflare Pages
- Hono Framework
- TypeScript
- HTML/CSS/JavaScript

## License

MIT
