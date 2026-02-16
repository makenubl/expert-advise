# Expert Advise - Your Personal Advisory Board

A web application that lets you chat with three of the world's most influential tech leaders: **Elon Musk** (Tesla, SpaceX, xAI), **Sam Altman** (OpenAI), and **Dario Amodei** (Anthropic). Get personalized advice on business, startups, AI, technology, and life decisions.

## Features

- **Group Chat Interface**: Ask questions and get responses from all three advisors simultaneously
- **AI-Powered**: Uses Google's Gemini 2.0 Flash model with custom system prompts for each advisor
- **Conversation History**: Maintains context across the conversation for more relevant advice
- **Beautiful UI**: Clean, modern interface built with Next.js and Tailwind CSS
- **Real-time Responses**: Get advice from all three advisors in parallel

## The Advisory Board

### Elon Musk - CEO of Tesla, SpaceX, xAI
- Focus: First principles thinking, manufacturing, solving existential problems
- Style: Direct, ambitious, rapid iteration
- Known for: Electric vehicles, reusable rockets, multi-planetary species vision

### Sam Altman - CEO of OpenAI
- Focus: AI development, startup strategy, long-term thinking
- Style: Thoughtful, optimistic, frameworks-driven
- Known for: Leading AI revolution, Y Combinator, backing transformative companies

### Dario Amodei - CEO of Anthropic
- Focus: AI safety, alignment research, responsible AI development
- Style: Technical, precise, balanced optimism with caution
- Known for: Constitutional AI, Claude, AI safety research

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Google Gemini API key

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

## Usage

1. **Ask a Question**: Type your question in the input field at the bottom
2. **Get Multiple Perspectives**: All three advisors will respond with their unique insights
3. **Continue the Conversation**: Follow up questions maintain context from previous messages
4. **Learn and Apply**: Get actionable advice from proven entrepreneurs

### Example Questions

- "How do I validate my startup idea?"
- "Should I raise funding or bootstrap my business?"
- "How can AI transform my industry?"
- "What are the biggest risks and opportunities in AI?"
- "How do I build a team for a moonshot project?"
- "What should I focus on when scaling a tech startup?"

## Project Structure

```
ExpertAdvise/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts        # API endpoint for chat
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   └── ChatInterface.tsx       # Main chat component
│   └── lib/
│       └── advisors.ts             # Advisor definitions & prompts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.0 Flash
- **API**: Google Generative AI SDK

## Customization

### Modify Advisor Personalities

Edit [src/lib/advisors.ts](src/lib/advisors.ts) to customize:
- System prompts for each advisor
- Advisor details (name, title, color)
- Add or remove advisors

### Change AI Model

In [src/app/api/chat/route.ts](src/app/api/chat/route.ts), update the model name:

```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", // Change this to use a different model
  systemInstruction: advisor.systemPrompt
});
```

Available models:
- `gemini-2.0-flash-exp` (Fast, recommended)
- `gemini-1.5-pro` (More capable, slower)
- `gemini-1.5-flash` (Balanced)

## Building for Production

```bash
npm run build
npm start
```

## Deploy

This app can be deployed to:
- [Vercel](https://vercel.com) (Recommended for Next.js)
- [Netlify](https://netlify.com)
- Any Node.js hosting platform

Remember to set the `GEMINI_API_KEY` environment variable in your deployment platform.

## License

MIT

## Acknowledgments

Inspired by the post from xaifhimself about creating a personal advisory board using AI.

---

Built with Claude Code
