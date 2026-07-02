# Push44

Version-control your AI-built apps to GitHub — in one tap. Supports Base44, Rocket.new, Floot, and Zite.

## Stack

- **React 19** + **Vite 8** + **TanStack Router**
- **Tailwind CSS v4** + Radix UI components
- **Bun** as package manager and runtime

## How to run

```bash
bun install
bun run dev
```

Dev server starts at `http://0.0.0.0:5000`.

The Replit workflow **Start application** runs `bun run dev` automatically.

## Project structure

```
src/
  routes/         TanStack Router file-based routes
  components/     Shared UI components
  contexts/       React context providers
  hooks/          Custom hooks
  assets/         Static assets
api/              Vite dev-server proxy plugins (floot, zite, github oauth)
vite.config.ts    Vite config + proxy middleware
```

## External services

- **GitHub API** — users supply their own Personal Access Token (PAT) in-app; no server-side secret needed
- **Base44 / Rocket.new / Floot / Zite** — accessed via user-supplied credentials in-app

## User preferences
