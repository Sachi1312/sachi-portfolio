# Sachi Parekh — Portfolio

```
Portfolio/
├── client/              static frontend
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   └── assets/          resume PDF + profile photo
├── api/
│   └── chat.js          Vercel serverless function — POST /api/chat -> Groq API (production)
├── server/               Express backend, used for LOCAL DEV ONLY (or as a Render deploy target)
│   ├── src/
│   │   ├── index.js         entry point, serves /client + mounts /api/chat
│   │   ├── routes/chat.js   POST /api/chat -> Groq API (Express version)
│   │   └── data/profile.js  resume facts fed to the chatbot as its system prompt (shared by both)
│   ├── .env              GROK_API_KEY=... (create from .env.example, never commit this)
│   └── .env.example
├── package.json          root manifest, "type":"module" so Vercel treats /api/chat.js as ESM
└── vercel.json           tells Vercel the static site lives in /client
```

There are **two ways to run this in production** — pick one:

## Option A: Vercel (recommended — free, no cold-start sleep)

Vercel serves `client/` as a static site over its CDN (always instant, no spin-down) and runs
`api/chat.js` as an on-demand serverless function (near-instant warm-up, nothing like a sleeping
container).

1. Push this repo to GitHub (already done if you're reading this after that step).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, **New Project**, import this repo.
3. Vercel auto-detects `vercel.json` — no build command needed, just confirm and deploy.
4. In the project's **Settings → Environment Variables**, add `GROK_API_KEY` = your real Groq key.
5. Redeploy (Vercel usually prompts this automatically after adding an env var).

That's it — your site + chatbot are both live, always fast, no sleep.

## Option B: Render (Express server, has free-tier cold-start sleep)

```bash
cd server
npm install
# edit .env and put your real key in GROK_API_KEY=...
npm run dev
```

Then open **http://localhost:5050** for local dev. To deploy this same server to Render: root
directory `server`, build `npm install`, start `npm start`, add `GROK_API_KEY` as an env var. Note
Render's free tier sleeps after ~15 min idle and takes 30-60s to wake back up on the next visit —
upgrade to a paid instance ($7/mo) to avoid that, or use Option A instead.

## Local dev

Either run the Express server above (`server/`, http://localhost:5050), or just open
`client/index.html` directly in a browser — everything works except the chatbot, which needs a
backend (Express locally, or `vercel dev` to run the serverless function locally) to keep the API
key private.
