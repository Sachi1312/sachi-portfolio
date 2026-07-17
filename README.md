# Sachi Parekh — Portfolio

```
Portfolio/
├── client/              static frontend (served by the Node server, or open index.html directly)
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   └── assets/          resume PDF + profile photo
└── server/              Express backend — proxies chatbot requests to the Grok API
    ├── src/
    │   ├── index.js         entry point, serves /client + mounts /api/chat
    │   ├── routes/chat.js   POST /api/chat -> xAI Grok API
    │   └── data/profile.js  resume facts fed to the chatbot as its system prompt
    ├── .env              GROK_API_KEY=... (create from .env.example, never commit this)
    └── .env.example
```

## Run it

```bash
cd server
npm install
# edit .env and put your real xAI key in GROK_API_KEY=...
npm run dev
```

Then open **http://localhost:5050** — the server serves the site and the chatbot works.

If you just open `client/index.html` directly in a browser (no server running), everything works
except the chatbot, which needs the backend to keep the API key private.
