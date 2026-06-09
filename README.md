# 🕹️ WebMCP-Ready Portfolio Website

A modern, pixel-art **portfolio website that both humans *and* AI agents can understand.** It looks great to a visitor — and it also exposes clean, structured **tools** that an AI agent can call directly using the emerging **WebMCP** standard, instead of scraping the page and guessing.

Built with plain **HTML, CSS, and JavaScript**. No frameworks, no build step, no backend. Open `index.html` and it just works.

> Made for the Codédex monthly project challenge — so it's beginner-friendly, fun, and styled to feel right at home in the Codédex world. 🟡

---

## 📸 Screenshot

> _Add a screenshot here once you've opened the site._ Save it as `screenshot.png` in this folder and it'll show below:

```md
![WebMCP-Ready Portfolio screenshot](screenshot.png)
```

---

## ✨ Features

- **Dual-audience design** — a polished site for humans, plus callable tools for AI agents.
- **7 structured agent tools** (`get_profile`, `list_skills`, `list_projects`, `filter_projects_by_stack`, `get_featured_project`, `get_contact_info`, `explain_why_agent_ready`).
- **Real WebMCP integration** — loads the `@mcp-b/global` polyfill so `navigator.modelContext` actually exists, then registers all 7 tools on it and verifies them via the API. Falls back gracefully offline / on `file://`.
- **Live "AI Agent Tools" demo panel** — click a button and see the exact JSON an agent would receive.
- **Project filtering** — filter by stack using the *same* logic the agent tool uses.
- **One source of truth** — the visible cards and the agent tools read from the same data, so they never disagree.
- **Copy-email button**, **dark/light theme toggle** (saved to `localStorage`), and **Schema.org JSON-LD** for extra machine-readability.
- **Responsive** and keyboard-friendly, with `prefers-reduced-motion` support.

---

## 🤖 Why agent-ready websites matter

AI agents are starting to *use* the web, not just read it. Today an agent has to scrape your HTML and guess what your buttons mean. That's brittle and error-prone.

A WebMCP-ready site flips this around: it hands the agent a clean menu of **named tools** with descriptions and input schemas. The agent can ask "what can I do here?" and get a real answer — `get_featured_project`, `filter_projects_by_stack`, and so on. Same site, two front doors: a visual one for people, a structured one for agents.

That's a small idea with a big payoff: your site becomes reliable for the next wave of AI browsers and assistants.

---

## 🧠 WebMCP vs MCP vs MCP-B

- **MCP** (Model Context Protocol) — the open standard for giving AI models tools & data; tools usually live on a **server**.
- **WebMCP** — the **browser** standard: a page registers tools on `navigator.modelContext`, so tools live in **client-side JS** (a W3C Web Machine Learning Community Group proposal).
- **MCP-B** — "MCP for the Browser": the runtime, transports, and extension that implement WebMCP today and bridge page tools to real MCP clients. This project uses its **`@mcp-b/global`** polyfill.

> One-liner: **WebMCP + MCP = MCP-B.** The full deep-dive — complete API surface, tool lifecycle, security model, how agents connect end-to-end, common pitfalls, and a cheat sheet — is in [`tutorial.md`](tutorial.md) (sections 15–16) and on the live tutorial page.

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| Markup | HTML5 (semantic) |
| Styling | Plain CSS (custom properties, grid/flex), Google Fonts (Press Start 2P, Inter, VT323) |
| Logic | Vanilla JavaScript (ES6, no dependencies) |
| Agent layer | Real WebMCP via the `@mcp-b/global` polyfill (`navigator.modelContext`) + safe fallback |
| Extras | Schema.org JSON-LD |

No `npm install`. No bundler. No backend.

---

## 📁 Folder structure

```
webmcp-ready-portfolio/
├── index.html      # Page structure + sections
├── style.css       # Codédex-inspired pixel theme (dark + light)
├── app.js          # Data, UI rendering, agent tools, WebMCP adapter
├── README.md       # You are here
└── tutorial.md     # Full step-by-step build tutorial
```

---

## ▶️ How to run locally

**Option A — just open it.** Double-click `index.html`. The site and the demo panel work immediately.

**Option B — run a local server (recommended).** WebMCP requires a *secure context* (HTTPS or `localhost`), so a local server is the best way to test real tool registration:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Either way, open your browser's DevTools console and try:

```js
agentTools.get_featured_project()
agentTools.filter_projects_by_stack({ stack: "Python" })
```

---

## 🛠️ Agent tools

All tools are **read-only** and return clean, JSON-serializable data.

| Tool | What it returns |
|------|-----------------|
| `get_profile()` | Name, role, bio, location, education, interests |
| `list_skills()` | Skills grouped by category |
| `list_projects()` | Every project (title, description, stack, tags, links, featured flag) |
| `filter_projects_by_stack({ stack })` | Projects matching a stack, e.g. `"Python"`, `"FastAPI"`, `"AI"` |
| `get_featured_project()` | The single strongest project to show first |
| `get_contact_info()` | Safe public contact info (GitHub, LinkedIn, email) |
| `explain_why_agent_ready()` | A plain-language explanation of the WebMCP approach |

They're exposed three ways: registered via WebMCP for agents, available on `window.agentTools` for scripts/console, and wired to the on-page demo panel for humans.

---

## 💬 Demo prompts

If you point a WebMCP-capable agent at this page (or just imagine one), these are the kinds of requests it can now answer by *calling tools* instead of scraping:

- "Show me Himanshu's AI projects."
- "Which project is best for a recruiter to look at first?"
- "List projects that use Python."
- "Summarize this portfolio for a hiring manager."
- "Find the strongest browser-based AI project."

---

## 🔌 Connect a real AI agent

The tools register on `navigator.modelContext` for real (via the polyfill). To actually call them from an agent:

1. **WebMCP / MCP-B browser extension** — install it, open the (hosted, HTTPS) page, and it bridges your registered tools to an MCP client like Claude Desktop. It auto-detects pages that loaded `@mcp-b/global`.
2. **Chrome native** — enable the `webmcp` flag in a recent Chrome/Canary; the built-in agent sees your tools directly.

**Verify it yourself:** open the hosted page, open DevTools, and run:

```js
await navigator.modelContextTesting.listTools(); // → the 7 registered tools
```

You'll also see `[WebMCP] Live tools verified via the API: …` logged automatically on load.

## 🔒 Safety note

This project intentionally ships **read-only** tools only. Each one is tagged with `annotations: { readOnlyHint: true }` so an agent knows it's always safe to call. There are no tools that send messages, spend money, or change data. If you add write-style tools later, gate them behind explicit user confirmation and keep private data out of tool responses.

---

## 🎨 Customization guide

Everything you'd want to change lives near the top of `app.js`:

- **Your details** → edit the `PROFILE` and `CONTACT` objects.
- **Your skills** → edit the `SKILLS` object (add/rename groups freely).
- **Your projects** → add an object to the `PROJECTS` array:
  ```js
  {
    id: "my-project",
    title: "My Project",
    description: "What it does and why it's cool.",
    highlight: "One-line standout fact",
    stack: ["JavaScript", "CSS"],
    tags: ["Web"],
    links: { demo: "https://...", github: "https://..." },
    featured: false
  }
  ```
- **Filter chips** → edit the `FILTERS` array.
- **Colors & fonts** → tweak the CSS custom properties at the top of `style.css` (`--gold`, `--periwinkle`, `--bg`, etc.). A light theme is already defined under `[data-theme="light"]`.

Update the data once and the cards, the filters, and the agent tools all update together.

---

## 🚀 Deployment

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages**.
3. Source: deploy from your branch (e.g. `main`), root folder.
4. Your site goes live at `https://<username>.github.io/<repo>/` — over HTTPS, so WebMCP can register in supporting browsers.

### Vercel
1. Import the repo at [vercel.com](https://vercel.com).
2. Framework preset: **Other** (it's a static site — no build command needed).
3. Deploy. Done.

---

## 📚 Learn more about WebMCP

- WebMCP spec (W3C Web Machine Learning Community Group): https://webmachinelearning.github.io/webmcp/
- WebMCP on Chrome for Developers: https://developer.chrome.com/docs/ai/webmcp

> Note: WebMCP is new and evolving. Native support is rolling out (Chrome Canary behind a `webmcp` flag), so this site loads the **`@mcp-b/global`** polyfill to make `navigator.modelContext` real today. Offline or on `file://`, the page falls back to the on-page demo — which always works.

---

Built by **Himanshu Kumar** · [GitHub](https://github.com/himanshu748) · [LinkedIn](https://linkedin.com/in/himanshu748)
