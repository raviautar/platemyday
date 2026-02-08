This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses [Bun](https://bun.sh) as the package manager and runtime.

First, install dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Create a `.env.local` file in the root directory with your Google AI API key:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Provider**: Google Gemini (via Vercel AI SDK)
- **State Management**: React Context
- **Validation**: Zod v3

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
