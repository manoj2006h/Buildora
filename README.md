# 🚀 Buildora

**Turn your ideas into websites — with AI.**

Buildora is a full-stack AI website builder. Describe the website you want in plain English, and an autonomous Gemini-powered agent generates a complete, responsive website using **HTML, Tailwind CSS, and vanilla JavaScript** — then previews it locally and publishes it to **Vercel** with one click.

> Built by [Manoj H](https://github.com/manoj2006h)

---

## ✨ Features

- 🤖 **AI website generation** — powered by Google Gemini
- ⚡ **Agentic workflow** — the AI creates files and runs commands inside an isolated project workspace
- 🎨 **Modern, responsive output** — HTML + Tailwind CSS + vanilla JavaScript (no frameworks)
- 👀 **Live preview** — generated sites are served instantly in an embedded iframe
- 🚀 **One-click Vercel publishing** — get a public `*.vercel.app` link
- 🔗 **New URL on every publish** — each deployment gets its own unique link
- ⌨️ **Keyboard-friendly** — press `Enter` to generate, `Shift + Enter` for a new line
- 💅 **Clean dark UI** — React + Tailwind CSS
- 🔒 **Server-side secrets** — API keys never reach the browser

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| AI | Google Gemini (`@google/genai`) |
| Generated sites | HTML, Tailwind CSS (CDN), vanilla JavaScript |
| Deployment | Vercel Deployments API |
| Linting | Oxlint |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐
│  Browser (React + Vite)     │
│  http://localhost:5173      │
└──────────────┬──────────────┘
               │ POST /api/generate
               │ POST /api/publish
               ▼
┌─────────────────────────────┐
│  Express server (:5001)     │
│                             │
│  runAgent() ──► Gemini API  │
│       │                     │
│       └── executeCommand()  │
│              │              │
│              ▼              │
│   server/projects/<id>/     │
│   index.html, script.js...  │
└──────────────┬──────────────┘
               │ POST /v13/deployments
               ▼
┌─────────────────────────────┐
│  Vercel Deployments API     │
│  https://<deployment>.app   │
└─────────────────────────────┘
```

---

## 📁 Project Structure

```
Buildora/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.jsx            # Main UI, generate + publish logic
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express backend
│   ├── index.js               # API routes (generate, publish, preview)
│   ├── agent.js               # Gemini agent + tool loop
│   ├── vercel.js              # Vercel deployment helper
│   ├── projects/              # Generated websites (one folder per project)
│   ├── .env                   # Secrets (gitignored)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** `20.19+` (Node 22 LTS or newer recommended)
- **npm** `10+`
- A **Google AI Studio** API key — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- A **Vercel** account + access token (only needed for publishing) — [vercel.com/account/tokens](https://vercel.com/account/tokens)

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/manoj2006h/Buildora.git
cd Buildora
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Configure environment variables

Create `server/.env`:

```env
# Required — Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key

# Required for publishing to Vercel
VERCEL_TOKEN=your_vercel_token

# Optional — only if deploying under a Vercel team
# VERCEL_TEAM_ID=team_xxxxxxxxxxxx
```

> 🔐 `.env` files are gitignored. **Never commit your API keys.**

#### Getting a Vercel token

1. Log in to [vercel.com](https://vercel.com) (the free Hobby plan works).
2. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
3. Click **Create Token**, give it a name (e.g. `buildora`), and copy it.
4. Paste it into `server/.env` as `VERCEL_TOKEN`.

### 4. Run the app

Open **two terminals**:

**Terminal 1 — backend**

```bash
cd server
npm start
```

Runs at `http://localhost:5001`.

**Terminal 2 — frontend**

```bash
cd client
npm run dev
```

Runs at `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

---

## 🎯 Usage

1. Describe the website you want, e.g.:
   > *Create a modern portfolio website for a computer science student*
2. Press **Enter** or click **Generate 🚀**.
3. The AI agent creates the project files and returns a summary.
4. Preview the result in the embedded **Live Preview**.
5. Click **Publish to Vercel 🚀** to deploy it.
6. Copy the generated public link and share it. Publishing again creates a **new URL**.

Example prompts:

- 💼 *Create a modern portfolio website for a computer science student*
- 🚀 *Create a modern landing page for a startup*
- 🍔 *Create a restaurant website with menu and contact section*

---

## 🔌 API Reference

Base URL: `http://localhost:5001`

### `GET /`

Health check.

```json
"ManojAI backend is running 🚀"
```

### `POST /api/generate`

Generate a new website from a prompt.

**Request**

```json
{
  "prompt": "Create a landing page for a startup"
}
```

**Response**

```json
{
  "success": true,
  "result": "Website generated successfully...",
  "projectId": "project-1793906045330",
  "previewUrl": "http://localhost:5001/preview/project-1793906045330/"
}
```

### `POST /api/publish`

Publish a generated project to Vercel.

**Request**

```json
{
  "projectId": "project-1793906045330"
}
```

**Response**

```json
{
  "success": true,
  "url": "https://buildora-project-1793906045330-xxxx.vercel.app",
  "deploymentId": "dpl_xxxxxxxxxxxxxxxx"
}
```

**Errors**

| Status | Reason |
| --- | --- |
| `400` | Invalid or missing `projectId` |
| `400` | Project has no `index.html` |
| `404` | Project not found |
| `500` | Vercel deployment failed / token missing |

### `GET /preview/:projectId/`

Serves the generated website's static files.

---

## 🧠 How It Works

### Generation

1. The frontend sends the prompt to `POST /api/generate`.
2. The backend creates a unique folder: `server/projects/project-<timestamp>/`.
3. `runAgent()` sends the prompt to Gemini with a strict system prompt:
   - **Allowed:** HTML, Tailwind CSS (CDN), vanilla JavaScript
   - **Forbidden:** React, Vue, Next.js, Vite, npm packages, other frameworks
4. Gemini calls the `executeCommand` tool to create and edit files in the workspace.
5. The agent loops until the site is complete, then returns a summary.
6. The site is served at `/preview/<projectId>/`.

### Publishing

1. The frontend sends `projectId` to `POST /api/publish`.
2. The backend reads every file in the project folder and base64-encodes it.
3. Files are sent to the [Vercel Deployments API](https://vercel.com/docs/rest-api/endpoints/deployments) with `target: "production"`.
4. The server polls until the deployment is `READY`.
5. Deployment Protection is disabled automatically so the link is publicly accessible.
6. The unique deployment URL is returned to the frontend.

---

## 📜 Scripts

### Client (`client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

### Server (`server/`)

| Command | Description |
| --- | --- |
| `npm start` | Start the Express server |

---

## 🔒 Security Notes

- API keys are read **only on the server** from `server/.env`.
- `.env` files are gitignored — never commit them.
- `projectId` is validated against `^project-\d+$` to prevent path traversal.
- Only `index.html`-containing projects can be published.
- If a token is ever exposed, revoke it immediately and create a new one.

---

## 🩺 Troubleshooting

| Problem | Fix |
| --- | --- |
| `EADDRINUSE: address already in use :::5001` | Stop the old server: `lsof -ti:5001 \| xargs kill` |
| `VERCEL_TOKEN is not set` | Add the token to `server/.env` and restart the server |
| `401` / `403` from Vercel | Token is invalid or lacks permission — create a new one |
| Published link redirects to a Vercel login | Deployment Protection is enabled — it is disabled automatically by `vercel.js` |
| `Failed to connect to ManojAI backend` | Make sure the backend is running on port `5001` |
| Gemini model error | Verify the model name in `server/agent.js` is available to your API key |

---

## 🗺️ Roadmap

- [ ] Custom project names and domains
- [ ] Project history / dashboard
- [ ] Download generated site as ZIP
- [ ] Edit an existing project with follow-up prompts
- [ ] Support additional deployment targets (Netlify, GitHub Pages)
- [ ] Authentication and per-user projects

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## 📄 License

Licensed under the **ISC License**.

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev/) — AI generation
- [Vercel](https://vercel.com/) — deployment platform
- [React](https://react.dev/) & [Vite](https://vite.dev/) — frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Express](https://expressjs.com/) — backend framework

---

<p align="center">Made with ❤️ by <a href="https://github.com/manoj2006h">Manoj H</a></p>
