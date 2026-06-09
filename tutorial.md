# 🕹️ Build a WebMCP-Ready Portfolio Website

*Make a portfolio that humans love **and** AI agents can actually use.*

---

## 1. The hook 🎣

Quick: picture your portfolio. Nice hero, some project cards, a contact button. Lovely. Built 100% for **human eyeballs**.

Here's the plot twist of 2026 — *humans aren't the only ones browsing anymore.* AI agents are starting to visit websites, click around, and pull out information on a person's behalf. "Hey, find me a good junior dev and summarize their best project." And right now, when an agent lands on your site, it has to do the web equivalent of squinting: scrape your HTML, guess what your buttons do, and hope it got it right.

That's silly. It's like handing someone a blender with no buttons and saying "figure it out." 🫠

What if, instead, your site offered the agent a clean little menu?

> 🤖 "What can I do here?"
> 🌐 "Glad you asked! You can call `get_featured_project()`, `list_projects()`, or `filter_projects_by_stack({ stack: 'Python' })`."

That's the whole idea behind **WebMCP** — and by the end of this tutorial, your portfolio will speak it. Same site, two front doors: a pretty one for people, a structured one for agents. Let's build it. 🛠️

---

## 2. What we're building

A single-page portfolio with the usual lovable sections — hero, about, skills, projects, contact — wearing a cozy pixel-art theme. Nothing exotic.

The *special* part is a small **tool registry**: a set of plain JavaScript functions that describe the portfolio in structured data. We'll expose them three ways:

1. To **AI agents** via the real **WebMCP** API (`navigator.modelContext`).
2. To **scripts & the console** via `window.agentTools`.
3. To **humans** via a clickable "AI Agent Tools" demo panel, so you can *see* exactly what an agent would get back.

And here's the trick that keeps it honest: **the visible project cards and the agent tools read from the same data.** Update it once, both update. No drift, no lies.

**What is WebMCP, really?** It's an emerging browser API (incubated in the W3C Web Machine Learning Community Group) that lets a web page register "tools" — named functions with descriptions and input schemas — that an in-browser AI agent can call directly. Think of it as your page acting like a tiny [MCP](https://modelcontextprotocol.io) server, except the tools live in client-side JavaScript instead of on a backend. 🧠

---

## 3. Prerequisites

You'll be comfy here if you know:

- 🧱 **Basic HTML** — tags, sections, attributes.
- 🎨 **Basic CSS** — selectors, a little flexbox/grid.
- ⚙️ **Basic JavaScript** — variables, functions, objects, arrays, and `addEventListener`.

And you'll need:

- 🌐 A modern **browser** (Chrome, Edge, Firefox, Safari).
- 📝 A **code editor** (VS Code is great).

No Node, no npm, no frameworks. If a tutorial ever makes you `npm install` 600 packages to render a hero section, run. 🏃

---

## 4. Project setup

Make a folder and five files. That's the whole project:

```
webmcp-ready-portfolio/
├── index.html      # structure
├── style.css       # the pixel-art look
├── app.js          # data + interactions + agent tools
├── README.md       # project notes
└── tutorial.md     # this file
```

Create them empty for now. We'll fill `index.html`, `style.css`, and `app.js` in that order.

---

## 5. Step 1 — Create the HTML layout

We're writing **semantic** HTML: a real `<header>`, `<main>`, `<section>` per area, and a `<footer>`. Semantic tags are free accessibility *and* free machine-readability.

Start with the skeleton and load your CSS + JS:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Himanshu Kumar — AI Tools Builder | WebMCP-Ready Portfolio</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- header, main, footer go here -->
  <script src="app.js" defer></script>
</body>
</html>
```

Two small things that matter:

- `data-theme="dark"` on `<html>` — our CSS reads this to switch themes. We'll flip it with a button later.
- `defer` on the script — it runs *after* the HTML is parsed, so the DOM is ready and we don't need a `DOMContentLoaded` wrapper.

Now the sections inside `<main>`. Here's the shape (full markup is in `index.html`):

```html
<main id="top">
  <section class="hero container"> ... </section>
  <section id="about"  class="section container"> ... </section>
  <section id="skills" class="section container">
    <div id="skills-grid" class="skills-grid"></div>   <!-- filled by JS -->
  </section>
  <section id="projects" class="section container">
    <div id="project-filters" class="filters"></div>   <!-- filled by JS -->
    <div id="projects-grid" class="projects-grid"></div><!-- filled by JS -->
  </section>
  <section id="agent-tools" class="section container"> ... </section>
  <section id="contact" class="section container"> ... </section>
</main>
```

Notice the empty `<div>`s with IDs like `skills-grid` and `projects-grid`. Those are **mount points** — JavaScript will render content into them from our data. (Why? Because that same data also powers the agent tools. One source of truth. 🙌)

For the **AI Agent Tools** section, lay out buttons that each carry a `data-tool` attribute (and optional `data-args`), plus a `<pre>` to show output:

```html
<div class="tool-buttons">
  <button class="tool-btn" data-tool="get_profile">Get Profile</button>
  <button class="tool-btn" data-tool="list_projects">List Projects</button>
  <button class="tool-btn" data-tool="filter_projects_by_stack" data-args='{"stack":"Python"}'>Filter Python Projects</button>
  <button class="tool-btn" data-tool="get_featured_project">Get Featured Project</button>
  <!-- ...and a few more -->
</div>
<pre id="tool-output">Click a tool above to see the JSON an AI agent would receive.</pre>
```

Those `data-` attributes are how each button knows which tool to run. Clean and beginner-friendly — no inline `onclick` spaghetti.

---

## 6. Step 2 — Style the portfolio

Since this is a Codédex project, we're matching the Codédex vibe: a **starry dark-navy night**, **gold** as the hero color, a **pixel display font** for headings and buttons, and blocky little "game" buttons. Cozy, retro, friendly. 🌙✨

First, load the fonts in `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800&family=VT323&display=swap" rel="stylesheet" />
```

- **Press Start 2P** → the chunky pixel font for headings, labels, and buttons.
- **Inter** → a clean, readable sans for body text (pixel fonts are adorable but unreadable in paragraphs 😅).
- **VT323** → a retro terminal font for our "agent view" code card.

Then set up **CSS custom properties** (variables) so the whole theme — and the light mode — lives in one place:

```css
:root {
  --bg: #0e1026;          /* deep navy night */
  --surface: #181b3a;     /* cards */
  --text: #f3f4ff;
  --muted: #a6acd9;
  --gold: #ffc619;        /* the hero accent */
  --gold-deep: #c98a00;   /* shadow under gold buttons */
  --periwinkle: #8b9cff;  /* active states & links */
  --font-pixel: "Press Start 2P", monospace;
  --font-body: "Inter", system-ui, sans-serif;
}

[data-theme="light"] {
  --bg: #fdf3e0;          /* warm daytime cream */
  --surface: #ffffff;
  --text: #1b1c3a;
  --gold: #f4b400;
  /* ...the rest of the light palette */
}
```

Now everything references those variables (`background: var(--bg)`, `color: var(--gold)`, …). Flip `data-theme` and the entire site re-themes for free. 🪄

Two signature touches that sell the look:

**The gold "game" button** — a solid color with a hard *bottom* shadow so it feels pressable, like an arcade button:

```css
.btn-primary {
  background: var(--gold);
  color: #10122b;
  border: 2px solid var(--gold-deep);
  box-shadow: 0 5px 0 0 var(--gold-deep);  /* the 3D edge */
  font-family: var(--font-pixel);
}
.btn-primary:active { transform: translateY(3px); box-shadow: 0 2px 0 0 var(--gold-deep); }
```

**The starfield** — pure CSS, no images. We layer tiny `radial-gradient` dots on a fixed pseudo-element behind everything:

```css
body::before {
  content: "";
  position: fixed; inset: 0; z-index: -1;
  background-color: var(--bg);
  background-image:
    radial-gradient(2px 2px at 18% 28%, rgba(255,255,255,.9), transparent),
    radial-gradient(2px 2px at 73% 16%, rgba(255,255,255,.75), transparent);
  /* ...a handful more stars */
}
```

Use CSS Grid for the skills/projects layouts (`grid-template-columns: repeat(auto-fit, minmax(290px, 1fr))`) so cards reflow on mobile with zero media-query fuss. Add a couple of breakpoints to tidy the header on phones, respect `prefers-reduced-motion`, and you're done styling.

---

## 7. Step 3 — Store portfolio data in JavaScript

Here's the most important habit in the whole project: **keep your content as data, not as hand-written HTML.**

At the top of `app.js`, describe yourself as plain objects and arrays:

```js
const PROFILE = {
  name: "Himanshu Kumar",
  role: "AI Tools Builder & Student Developer",
  bio: "Computer-science student who builds browser-based AI apps and developer tools...",
  location: "Lucknow, India (open to remote)",
  education: "B.Tech in Computer Science (AI & Data Science), graduating 2027",
  interests: ["AI agents", "Web development", "Python", "JavaScript", "FastAPI", "Developer tools", "Browser-based AI"],
};

const SKILLS = {
  Languages: ["Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  Frontend: ["Responsive design", "Vanilla JS", "Canvas API", "DOM & accessibility"],
  Backend: ["FastAPI", "Uvicorn", "httpx", "REST APIs"],
  "AI / ML": ["NumPy", "Pyodide", "Hugging Face", "LLM prompting", "AI agents", "MCP / WebMCP"],
  "Tools / Platforms": ["Git & GitHub", "GitHub Pages", "Vercel", "WebAssembly", "VS Code"],
};

const PROJECTS = [
  {
    id: "pixel-digit-recognizer",
    title: "Pixel Digit Recognizer",
    description: "Draw a digit and a real neural network guesses it — running 100% in your browser...",
    highlight: "~97.8% test accuracy, fully client-side",
    stack: ["Python", "NumPy", "Pyodide", "WebAssembly", "JavaScript", "HTML"],
    tags: ["AI/ML", "Browser AI"],
    links: {
      demo: "https://himanshu748.github.io/pixel-digit-recognizer/",
      github: "https://github.com/himanshu748/pixel-digit-recognizer",
    },
    featured: true,
  },
  // ...more projects
];
```

Why bother? Three reasons:

1. **One source of truth.** The visible cards *and* the agent tools both read `PROJECTS`. They literally cannot disagree.
2. **Editing is trivial.** Add a project? Push one object into the array. The UI and the tools both update.
3. **It's already agent-shaped.** Structured data is exactly what an agent wants. We're 80% of the way to "agent-ready" just by being organized. 🎯

---

## 8. Step 4 — Build normal portfolio interactions

Before any AI magic, let's make the human site work: render the data, and add filtering + a couple of buttons.

**Render skills and projects from data.** A small function builds the HTML and drops it into our mount points:

```js
function renderSkills() {
  const grid = document.getElementById("skills-grid");
  grid.innerHTML = Object.entries(SKILLS)
    .map(([group, items]) => `
      <article class="skill-card">
        <h3>${esc(group)}</h3>
        <ul class="badges">${items.map((s) => `<li class="badge">${esc(s)}</li>`).join("")}</ul>
      </article>`)
    .join("");
}
```

> 🛡️ `esc()` is a tiny helper that escapes `<`, `>`, `&`, `"` before we inject text. Good habit, even with your own data.

**Filtering** is where we set up a pattern we'll reuse for agents. Write the matching logic *once* as a standalone function:

```js
function projectMatchesStack(project, stack) {
  const query = String(stack || "").trim().toLowerCase();
  if (!query) return true; // empty = match everything
  const haystack = [...project.stack, ...project.tags].map((s) => s.toLowerCase());
  return haystack.some((item) => item.includes(query));
}
```

Now both the filter chips *and* the `filter_projects_by_stack` agent tool call this same function. When a chip is clicked, we just re-render:

```js
function wireFilters() {
  document.getElementById("project-filters").addEventListener("click", (event) => {
    const btn = event.target.closest(".filter");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    renderFilters();
    renderProjects();
  });
}
```

Add a **theme toggle** (flip `data-theme`, save to `localStorage`) and a **copy-email button** (`navigator.clipboard.writeText(...)` with a friendly fallback), and the human site is complete. 🎉

---

## 9. Step 5 — Add the agent tool registry

Now the fun part. A "tool" is just a function that returns clean, structured data. Let's collect them into one object called `agentTools`:

```js
// Return a deep, JSON-safe copy so callers can't mutate our source data.
const clone = (value) => JSON.parse(JSON.stringify(value));

const agentTools = {
  get_profile() {
    return clone({
      name: PROFILE.name, role: PROFILE.role, bio: PROFILE.bio,
      location: PROFILE.location, education: PROFILE.education, interests: PROFILE.interests,
    });
  },

  list_skills() { return clone(SKILLS); },

  list_projects() { return clone(PROJECTS); },

  filter_projects_by_stack(input) {
    const stack = input && input.stack ? input.stack : "";
    const matches = PROJECTS.filter((p) => projectMatchesStack(p, stack));
    return clone({ query: stack || "(none — returning all)", count: matches.length, results: matches });
  },

  get_featured_project() {
    return clone(PROJECTS.find((p) => p.featured) || PROJECTS[0]);
  },

  get_contact_info() {
    return clone({
      github: "https://github.com/himanshu748",
      linkedin: "https://linkedin.com/in/himanshu748",
      email: "jhahimanshu653@gmail.com",
      twitter: null, // null = not provided. We don't fake links. 🙅
    });
  },

  explain_why_agent_ready() {
    return clone({
      summary: "This portfolio exposes its content as structured, callable tools, so an AI agent doesn't have to scrape HTML or guess from button labels.",
      tools: Object.keys(agentTools),
    });
  },
};
```

A few design choices worth copying:

- **All read-only.** Every tool only *reads* data. None of them send, delete, or change anything. (More on why in the safety section.)
- **`clone()` everywhere.** Returning copies means a caller can't accidentally mutate your real `PROJECTS`. It also guarantees the output is clean JSON.
- **Reuse, don't repeat.** `filter_projects_by_stack` calls the *same* `projectMatchesStack` your filter chips use.

Notice `get_contact_info` returns `twitter: null` instead of inventing a handle. If you don't have something, say so. Honesty makes the data trustworthy — for humans *and* agents. ✅

---

## 10. Step 6 — Add the WebMCP adapter

Time to let real agents call these tools — for real. WebMCP exposes a browser object, `navigator.modelContext` (the spec also defines `document.modelContext`), with a `registerTool()` method. We'll:

1. **Load the polyfill** so `navigator.modelContext` actually exists in today's browsers.
2. Describe each tool with a **name**, **description**, and **input schema**.
3. **Feature-detect** the API and register every tool — or **fall back gracefully** if it's missing.

### Make the API real with one script tag

Native WebMCP is still rolling out (Chrome Canary behind a `webmcp` flag), so to make this work in browsers today we load the official **`@mcp-b/global`** polyfill from the WebMCP / MCP-B project. It auto-installs `navigator.modelContext` — no build step:

```html
<!-- in <head>, before app.js -->
<script defer src="https://unpkg.com/@mcp-b/global@3.0.0/dist/index.iife.js"></script>
```

That's it — `navigator.modelContext` is now live, and the `registerTool` calls below are the real thing. (If this script can't load — offline, `file://`, or a blocked CDN — the page quietly falls back to the on-page demo.)

Now, the tool descriptions. The `inputSchema` is standard **JSON Schema** — it tells the agent what arguments to pass:

```js
const WEBMCP_TOOLS = [
  {
    name: "get_profile",
    description: "Get Himanshu Kumar's name, role, short bio, location, education, and interests.",
    inputSchema: { type: "object", properties: {} },
    run: () => agentTools.get_profile(),
  },
  {
    name: "filter_projects_by_stack",
    description: "Return the projects that use a given technology or stack, e.g. 'Python', 'FastAPI', 'AI'.",
    inputSchema: {
      type: "object",
      properties: { stack: { type: "string", description: "A technology or category to filter by." } },
      required: ["stack"],
    },
    run: (input) => agentTools.filter_projects_by_stack(input || {}),
  },
  // ...one entry per tool
];
```

Agents expect results in a specific **MCP shape**, so we wrap our plain data:

```js
function toMcpResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}
```

Now feature-detect — *never assume the API exists*, and never throw if it doesn't:

```js
function getModelContext() {
  const mc =
    (typeof navigator !== "undefined" && navigator.modelContext) ||
    (typeof document !== "undefined" && document.modelContext) ||
    null;
  return mc && typeof mc.registerTool === "function" ? mc : null;
}
```

And finally, the star of the show — `registerAgentTools()`:

```js
function registerAgentTools() {
  const mc = getModelContext();

  if (!mc) {
    // No agent API here — fall back quietly. The demo panel still works.
    return { registered: false, reason: "WebMCP API not detected", count: 0 };
  }

  let count = 0;
  for (const tool of WEBMCP_TOOLS) {
    try {
      mc.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: true }, // "safe to call — only reads data"
        async execute(input) {
          return toMcpResult(await tool.run(input));
        },
      });
      count += 1;
    } catch (err) {
      console.warn(`[WebMCP] Could not register "${tool.name}":`, err);
    }
  }
  return { registered: true, count };
}
```

That's the entire adapter. Two things to call out:

- **`annotations: { readOnlyHint: true }`** is a real WebMCP safety signal. It tells the agent "this tool only reads — it's always safe to call."
- **It's really registered now.** Because we loaded the `@mcp-b/global` polyfill, `getModelContext()` returns a real object and all 7 tools register on `navigator.modelContext`. The fallback only kicks in when the polyfill can't load (offline, `file://`, blocked CDN) — then the demo panel covers you. WebMCP also needs a **secure context** (HTTPS or `localhost`).

Finally, on page load, expose the tools, register them once the polyfill is ready, and **verify** with the API itself:

```js
window.agentTools = agentTools; // for the console & test scripts

// The polyfill may load a moment after us, so poll briefly, then register.
function setupWebMCP() {
  let tries = 0;
  (function attempt() {
    if (getModelContext()) {
      updateWebmcpStatus(registerAgentTools());
      verifyRegistration();              // ask the API which tools are live
    } else if (++tries < 24) {
      setTimeout(attempt, 150);          // ~3.6s of patience for the CDN
    } else {
      updateWebmcpStatus({ registered: false });
    }
  })();
}
setupWebMCP();
```

And the honest proof — ask WebMCP itself what's registered:

```js
async function verifyRegistration() {
  // The polyfill installs a testing surface; @mcp-b/global also adds listTools().
  const tools = await navigator.modelContextTesting.listTools();
  console.log("Live WebMCP tools:", tools.map((t) => t.name));
}
```

Open DevTools on the hosted page and you'll see all 7 tool names logged — actually registered on `navigator.modelContext`, ready for an agent.

### Connect a real AI agent

Two ways to call these tools from an agent:

1. **WebMCP / MCP-B browser extension** — install it, open your page, and it bridges your registered tools to an MCP client (like Claude Desktop). It auto-detects pages that loaded `@mcp-b/global`.
2. **Chrome's native support** — enable the `webmcp` flag in a recent Chrome/Canary; the browser's built-in agent can then see your tools directly.

Either way, you wrote zero agent code — you just *described your tools*, and the browser does the rest. ✨

---

## 11. Step 7 — Build the demo panel

Even with real WebMCP wired up, the tools are invisible without an agent — so let's give humans a way to *experience* them. The demo panel calls the **exact same `agentTools`** an agent would.

Remember those `data-tool` buttons? One delegated handler wires them all:

```js
function runToolInPanel(name, args) {
  const output = document.getElementById("tool-output");
  const label  = document.getElementById("tool-output-label");

  const argText = args && Object.keys(args).length ? JSON.stringify(args) : "";
  label.textContent = `// agentTools.${name}(${argText})`;       // show the "call"

  const result = agentTools[name](args || {});
  output.textContent = JSON.stringify(result, null, 2);          // show the JSON
}

document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const args = btn.dataset.args ? JSON.parse(btn.dataset.args) : {};
    runToolInPanel(btn.dataset.tool, args);
  });
});
```

Add a tiny `<form>` with a text input so visitors can type *any* stack and call `filter_projects_by_stack` with it, and a "Copy JSON" button, and your panel is alive. Click "Get Featured Project" → boom, structured JSON appears. That JSON is **literally** what an agent receives. Seeing it click into place is the "aha!" moment. 💡

---

## 12. Try these demo prompts

Once a WebMCP-capable agent can see your page, these requests stop being "scrape and pray" and become clean tool calls:

- 🗂️ "Show me Himanshu's AI projects." → `filter_projects_by_stack({ stack: "AI" })`
- 🥇 "Which project is best for a recruiter to look at first?" → `get_featured_project()`
- 🐍 "List projects that use Python." → `filter_projects_by_stack({ stack: "Python" })`
- 📝 "Summarize this portfolio for a hiring manager." → `get_profile()` + `list_projects()`
- 🔬 "Find the strongest browser-based AI project." → `filter_projects_by_stack({ stack: "Browser AI" })`

Try them yourself right now in the console: open DevTools and run `agentTools.filter_projects_by_stack({ stack: "Python" })`. 🤓

---

## 13. Safety notes 🔒

Exposing tools to agents is powerful, so be a responsible wizard:

- **Expose read-only tools first.** Everything in this project only *reads* data. Tag them `readOnlyHint: true` so agents know they're safe.
- **Avoid destructive tools.** No "delete account," no "send 100 emails." If a tool can cause harm or cost money, think hard before shipping it.
- **Use confirmation for risky actions.** If you ever add a write tool (e.g. "send a message"), require explicit user confirmation. WebMCP even has a `requestUserInteraction()` hook for exactly this.
- **Keep tool names clear.** `get_contact_info` is obvious. `doStuff` is not. Clear names + good descriptions = agents that behave.
- **Don't expose private data.** Tools return only what you'd happily put on a public page. Notice we returned `twitter: null` rather than leaking or faking anything.

Golden rule: **a tool should never let an agent do something the user couldn't already do safely themselves.**

---

## 14. Final challenge ideas 🚀

You've got a working agent-ready portfolio. Want to level up? Try:

- ✍️ **Add a blog.** Put posts in a `POSTS` array and add a `list_blog_posts()` tool.
- 📄 **Add a resume download** + a `get_resume_link()` tool.
- ⭐ **Add project scoring.** Give each project a `score`, then build `get_top_projects({ limit })`.
- 📬 **Add a contact form** — and if it actually sends, gate it behind a confirmation step (practice that safety muscle!).
- 🔌 **Wire up a real WebMCP client.** Try the `@mcp-b/global` polyfill or Chrome Canary's `webmcp` flag and watch your tools register for real.

---

## 15. WebMCP, in depth 🧠

You've built it — now here's *everything* worth knowing about WebMCP, so you actually understand what you shipped.

### The big idea

For 30 years the web was built for human eyes: pages, buttons, layouts. Now AI agents browse too — and making them *scrape* HTML and guess what a button does is fragile. **WebMCP flips it:** a page hands the agent a clean list of **tools** (named functions with typed inputs), so the agent calls `get_featured_project()` instead of reverse-engineering your DOM.

### MCP vs WebMCP vs MCP-B

These three names confuse everyone. Here's the clean split:

| Name | What it is | Where tools live |
|------|-----------|------------------|
| **MCP** (Model Context Protocol) | The open standard for giving AI models tools & data. | Usually a **server** (HTTP / stdio). |
| **WebMCP** | The **browser** standard: register tools on `navigator.modelContext`. A W3C Web Machine Learning Community Group proposal. | **Client-side JavaScript** on the page. |
| **MCP-B** | The runtime + transports + browser **extension** that implement WebMCP today and bridge page tools to real MCP clients. "MCP for the Browser." | Same page tools, made reachable by agents. |

One-liner from the project itself: **WebMCP + MCP = MCP-B.**

### The mental model

> A WebMCP page is a **client-side MCP server.** The tools run in the browser tab, with the user's existing session and login — so an agent acts *as the user*, not as some external bot with separate credentials.

That's the superpower: no separate API, no second auth, no scraping. The page already knows how to do things; WebMCP just *exposes* those things as callable tools.

### The API surface

The whole standard hangs off one object:

```js
// The spec defines document.modelContext; today's implementations also expose
// navigator.modelContext. Portable code checks both.
const mc = navigator.modelContext || document.modelContext;
```

Its one essential method is `registerTool(tool, options?)`.

### Anatomy of a tool

```js
navigator.modelContext.registerTool({
  name: "search_products",          // required, unique, [a-zA-Z0-9_.-], ≤128 chars
  title: "Search products",         // optional human/agent-friendly display name
  description: "Search the catalog by keyword.", // required — agents read this to decide when to call
  inputSchema: {                    // JSON Schema describing the arguments
    type: "object",
    properties: { query: { type: "string", description: "Search terms" } },
    required: ["query"],
  },
  annotations: { readOnlyHint: true }, // safety hints (see below)
  async execute({ query }) {        // the function the agent runs
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return { content: [{ type: "text", text: await res.text() }] };
  },
});
```

- **`name`** — unique id. Registering a duplicate name **throws**. Use clear, namespaced names (`search_docs`, not `doStuff`).
- **`description`** — this is the agent's *instruction manual* for the tool. Write it for the model, not just for yourself.
- **`inputSchema`** — standard **JSON Schema**. Be explicit (`enum`, `required`, `minimum`…). A vague `{ type: "object" }` tells the agent nothing. Omitted ⇒ defaults to `{ type: "object", properties: {} }`.
- **`execute`** — sync or async; receives the parsed args; returns an MCP result.
- **`annotations`** — hints that help an agent decide *how safe* a call is.

### What `execute` returns: MCP content blocks

Results use MCP's content shape — an array of blocks:

```js
return { content: [{ type: "text", text: JSON.stringify(data) }] };
```

`text` is the everyday block. MCP also defines other block types (e.g. image, resource) for richer returns. Keep the payload **LLM-friendly**: clean JSON or plain text the model can parse. On failure, return a structured error rather than throwing silently — the agent can surface it.

### Tool lifecycle (register / update / remove)

- **Register** as early as the relevant UI exists. Don't register at module scope before the DOM/feature is ready.
- **Remove** with an `AbortSignal` — the current, recommended path:

```js
const ac = new AbortController();
navigator.modelContext.registerTool(myTool, { signal: ac.signal });
// later (e.g. component unmount):
ac.abort(); // tool is unregistered
```

- **SPAs:** scope tool lifetimes to component lifetimes (register on mount, abort on unmount) so agents never see "ghost" tools for UI that's gone.
- **Deprecated:** `provideContext()` and `clearContext()` were removed in the March 2026 spec revision; `unregisterTool(name)` is being phased out in favor of `AbortSignal`. They may still work but emit warnings.

### Discovering & calling tools

The exact helper depends on the implementation:

| Method | Where | Purpose |
|--------|-------|---------|
| `getTools()` / `executeTool(name, argsJson)` | Chrome native imperative API | List & run tools (returns `null` if a call triggers navigation) |
| `listTools()` / `callTool({ name, arguments })` | `@mcp-b/global` | List & run via the MCP-B runtime |
| `navigator.modelContextTesting.listTools()` | testing shim (polyfills) | Inspect what's registered — great for self-tests |
| `requestUserInteraction(cb)` | spec (`ModelContextClient`) | Ask for a user gesture/confirmation before a sensitive action |

That's exactly how our portfolio *verifies itself* — it calls `navigator.modelContextTesting.listTools()` and shows the live count.

### The security model 🔒

WebMCP is deliberately cautious — copy these habits:

- **Secure context required.** WebMCP only works over **HTTPS** (or `localhost`).
- **`readOnlyHint: true`** — marks a tool that only *reads*, never mutates. Signals "always safe to call."
- **`untrustedContentHint`** — flags that a tool's output may contain untrusted/user-generated content, so the agent treats it carefully.
- **Cross-origin isolation.** Tools are **not** exposed to cross-origin iframes by default. To share with a trusted origin, use the `exposedTo: ["https://partner.com"]` option (HTTPS only) and the `tools` Permissions Policy.
- **Confirm risky actions.** Anything that sends, deletes, pays, or changes state should require explicit user confirmation (`requestUserInteraction`).
- **Never expose private data.** A tool should return only what the user could already see/do safely themselves.

### Browser support today (mid-2026)

| Browser | Native WebMCP | Polyfill works? |
|---------|---------------|-----------------|
| Chrome / Edge (with `webmcp` flag) | Yes | n/a |
| Chrome / Edge (default) | No | Yes |
| Firefox | No | Yes |
| Safari | No | Yes |

Because native support is still rolling out, you load a polyfill — and always **feature-detect**:

```js
if ("modelContext" in navigator && "registerTool" in navigator.modelContext) {
  // safe to register
}
```

Two polyfill choices from the MCP-B project:
- **`@mcp-b/global`** — polyfill **plus** the MCP-B bridge (so the extension/agents can reach your tools). *This is what our project uses.*
- **`@mcp-b/webmcp-polyfill`** — the strict core only (just installs `navigator.modelContext`).

### How an agent actually calls your tools (end-to-end)

1. Your page loads `@mcp-b/global` → `navigator.modelContext` exists.
2. You `registerTool(...)` → tools live in the tab.
3. The user has the **MCP-B browser extension** (or Chrome's native WebMCP) installed.
4. The extension detects your page's tools and exposes them to an **MCP client** (Claude Desktop, an in-browser assistant, etc.).
5. The agent calls a tool → your `execute()` runs in the page → the result flows back. **You wrote no agent code.**

For desktop MCP clients, `@mcp-b/webmcp-local-relay` bridges browser tools over WebSocket + stdio.

### WebMCP vs server-side MCP — when to use which

| | WebMCP (browser) | Server-side MCP |
|---|---|---|
| Tools run | In the page, as the logged-in user | On a server |
| Auth | Reuses the user's session/cookies | Needs its own credentials |
| Setup | A script tag, no backend | Host & run an MCP server |
| Best for | Acting on *this* site for *this* user | Shared/backend capabilities, multiple clients |

They're complementary — many apps will offer both, with matching tool names.

### Best practices (the short list)

- Write **descriptions for the model**; be specific.
- Make **schemas explicit** (enums, required, ranges).
- **Return clean JSON/text**; on error, return a structured error, don't throw silently.
- **Namespace tool names** to avoid collisions.
- **Scope lifecycles** (register/abort with the UI).
- Add **Schema.org JSON-LD** as a complementary signal (agents read it too — our page does this in `<head>`).

### Common pitfalls (learn from others)

- Registering at **module scope** before the DOM/feature is ready.
- **Leaky SPAs**: forgetting to abort → ghost tools the agent can still call.
- **Over-broad schemas**: `{ type: "object" }` with no properties.
- **Silent `execute` failures**: always `try/catch` and return an error block.
- **Wrong load order**: the polyfill must run before code that touches `navigator.modelContext` (we side-step this by polling).
- **Forgetting HTTPS**: no secure context ⇒ no WebMCP.

### Spec status & the future

WebMCP is incubated in the **W3C Web Machine Learning Community Group** (latest draft: April 23, 2026). It's young and moving — APIs like `provideContext`/`clearContext` were already removed. Track it via the W3C spec and Chrome's "AI on Chrome" docs. The direction is clear: **the agent-readable web is becoming a first-class platform feature.**

---

## 16. WebMCP cheat sheet 📌

**The smallest possible tool:**

```js
navigator.modelContext.registerTool({
  name: "get_page_title",
  description: "Get the current page title",
  inputSchema: { type: "object", properties: {} },
  async execute() {
    return { content: [{ type: "text", text: document.title }] };
  },
});
```

**API at a glance:**

| Thing | Quick reference |
|-------|-----------------|
| Entry object | `navigator.modelContext` (or `document.modelContext`) |
| Register | `registerTool({ name, description, inputSchema, execute, annotations }, { signal })` |
| Unregister | `ac.abort()` via the `AbortSignal` you passed |
| Result shape | `{ content: [{ type: "text", text }] }` |
| Safety hints | `annotations: { readOnlyHint, untrustedContentHint }` |
| Inspect (test) | `navigator.modelContextTesting.listTools()` |
| Feature-detect | `"modelContext" in navigator && "registerTool" in navigator.modelContext` |
| Requirement | Secure context (**HTTPS** or `localhost`) |
| Make it real today | `<script src="https://unpkg.com/@mcp-b/global@3.0.0/dist/index.iife.js"></script>` |

**Glossary:** **MCP** = the protocol · **WebMCP** = the browser API (`navigator.modelContext`) · **MCP-B** = the browser runtime/extension that runs it · **tool** = a named function an agent can call · **`inputSchema`** = JSON Schema for the args · **content block** = a piece of an MCP result · **`readOnlyHint`** = "this tool only reads."

**Go deeper:**
- WebMCP spec (W3C): https://webmachinelearning.github.io/webmcp/
- AI on Chrome — WebMCP: https://developer.chrome.com/docs/ai/webmcp
- MCP-B docs: https://docs.mcp-b.ai
- Model Context Protocol: https://modelcontextprotocol.io

---

## 🎬 That's a wrap

You built a portfolio that's genuinely **dual-audience**: gorgeous for humans, structured for machines. More importantly, you learned a mindset — *treat your site's capabilities as a clean set of tools* — that's going to matter a lot as AI agents become regular visitors.

Now go make it yours. Swap in your data, your projects, your colors. And the next time an AI agent comes knocking, your site won't make it squint. It'll just hand over the menu. 🤝

*Happy building! — and if you ship it, tag it so the world can see an agent-ready site in the wild.* ✨
