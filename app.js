/* =================================================================
   WebMCP-Ready Portfolio — app.js
   -----------------------------------------------------------------
   This single file does four jobs:
     1. Holds all portfolio DATA (profile, skills, projects).
     2. Defines a clean agentTools REGISTRY (the 7 callable tools).
     3. Wires up the normal HUMAN portfolio (rendering, filters, theme).
     4. Adds a safe WebMCP ADAPTER so AI agents can call the same tools.

   No frameworks. No build step. Open index.html and it just works.
   ================================================================= */

(function () {
  "use strict";

  /* =================================================================
     1. DATA  —  the single source of truth
     Keeping data here (instead of buried in HTML) means humans AND
     agents read from the exact same place. Update it once, everywhere
     updates: the cards, the filters, and the agent tools.
     ================================================================= */

  const PROFILE = {
    name: "Himanshu Kumar",
    role: "AI Tools Builder & Student Developer",
    bio: "Computer-science student who builds browser-based AI apps and developer tools. I like making AI ideas clickable — and writing beginner-friendly tutorials along the way.",
    location: "Lucknow, India (open to remote)",
    education: "B.Tech in Computer Science (AI & Data Science), graduating 2027",
    interests: [
      "AI agents",
      "Web development",
      "Python",
      "JavaScript",
      "FastAPI",
      "Developer tools",
      "Browser-based AI",
    ],
  };

  const SKILLS = {
    Languages: ["Python", "JavaScript", "TypeScript", "HTML", "CSS"],
    Frontend: ["Responsive design", "Vanilla JS", "Canvas API", "DOM & accessibility"],
    Backend: ["FastAPI", "Uvicorn", "httpx", "REST APIs"],
    "AI / ML": ["NumPy", "Pyodide", "Hugging Face", "LLM prompting", "AI agents", "MCP / WebMCP"],
    "Tools / Platforms": ["Git & GitHub", "GitHub Pages", "Vercel", "WebAssembly", "VS Code"],
  };

  // Every link below was verified to be real. featured:true marks the
  // single strongest project, returned by get_featured_project().
  const PROJECTS = [
    {
      id: "pixel-digit-recognizer",
      title: "Pixel Digit Recognizer",
      description:
        "Draw a digit and a real neural network guesses it — running 100% in your browser. A NumPy net (784→64→10) is trained offline, then the same Python runs live via Pyodide (Python compiled to WebAssembly). No server, no API calls.",
      highlight: "~97.8% test accuracy, fully client-side",
      stack: ["Python", "NumPy", "Pyodide", "WebAssembly", "JavaScript", "HTML"],
      tags: ["AI/ML", "Browser AI"],
      links: {
        demo: "https://himanshu748.github.io/pixel-digit-recognizer/",
        github: "https://github.com/himanshu748/pixel-digit-recognizer",
      },
      featured: true,
    },
    {
      id: "pr-review-agent",
      title: "AI PR Review Agent",
      description:
        "A FastAPI app that pulls a GitHub pull-request diff, sends a bounded prompt to a Hugging Face model (Qwen2.5-72B-Instruct), and returns a structured review: a summary, severity-tagged issues, suggestions, and a final APPROVE / REQUEST CHANGES verdict — in a clean single-page UI.",
      highlight: "Summary, severity, suggestions + a clear verdict",
      stack: ["FastAPI", "Python", "httpx", "Hugging Face", "JavaScript"],
      tags: ["AI/ML", "Developer Tools", "LLM"],
      links: {
        github: "https://github.com/himanshu748/pr-review-agent",
      },
      featured: false,
    },
    {
      id: "omnidev",
      title: "Omnidev",
      description:
        "An all-in-one AI developer platform that brings DevOps, web scraping, vision, storage, and location tools under a single roof — one place to reach for common build-time tasks.",
      highlight: "DevOps · Scraping · Vision · Storage · Location",
      stack: ["TypeScript", "JavaScript", "Vercel"],
      tags: ["AI", "Developer Tools", "Web"],
      links: {
        demo: "https://omnidev-flame.vercel.app",
        github: "https://github.com/himanshu748/omnidev",
      },
      featured: false,
    },
    {
      id: "sentinel",
      title: "Sentinel",
      description:
        "A personal crypto research agent built on ElizaOS and the Nosana decentralized GPU network. It produces market briefings, token analysis, news digests, and deep-dive research from sources like CoinGecko, DeFiLlama, and Solana RPC.",
      highlight: "Built for the Nosana × ElizaOS Builders Challenge",
      stack: ["TypeScript", "ElizaOS", "Nosana", "Solana"],
      tags: ["AI Agent", "Crypto"],
      links: {
        github: "https://github.com/himanshu748/sentinel-nosana-agent",
      },
      featured: false,
    },
  ];

  const CONTACT = {
    github: "https://github.com/himanshu748",
    linkedin: "https://linkedin.com/in/himanshu748",
    email: "jhahimanshu653@gmail.com",
    // No public X/Twitter handle is confirmed, so we keep it null rather
    // than inventing one. Honesty > a fake link.
    twitter: null,
    preferredContact: "GitHub or email",
    note: "Open to internships, collaborations, and interesting AI/web problems.",
  };

  /* Small helper: return a deep, JSON-safe copy so tool callers can never
     accidentally mutate our source data, and every result serializes cleanly. */
  const clone = (value) => JSON.parse(JSON.stringify(value));

  /* Safe localStorage access — never throws. Sandboxed iframes (no
     allow-same-origin) and some privacy modes block storage, so we guard it. */
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked — ignore */ }
  }

  /* Shared matching logic — used by BOTH the human filter chips and the
     filter_projects_by_stack agent tool, so they can never disagree. */
  function projectMatchesStack(project, stack) {
    const query = String(stack || "").trim().toLowerCase();
    if (!query) return true; // empty query = match everything
    const haystack = [...project.stack, ...project.tags].map((s) => s.toLowerCase());
    return haystack.some((item) => item.includes(query));
  }

  /* =================================================================
     2. AGENT TOOLS  —  the registry
     Each tool is a plain function that returns plain, JSON-serializable
     data. They're all READ-ONLY: they describe, they never change anything.
     ================================================================= */

  const agentTools = {
    /** Who is this person? */
    get_profile() {
      return clone({
        name: PROFILE.name,
        role: PROFILE.role,
        bio: PROFILE.bio,
        location: PROFILE.location,
        education: PROFILE.education,
        interests: PROFILE.interests,
      });
    },

    /** Skills, grouped the way a human would explain them. */
    list_skills() {
      return clone(SKILLS);
    },

    /** Every project, with stack, tags, links, and a featured flag. */
    list_projects() {
      return clone(PROJECTS);
    },

    /** Projects that use a given stack/technology (e.g. "Python", "FastAPI", "AI"). */
    filter_projects_by_stack(input) {
      const stack = input && input.stack ? input.stack : "";
      const matches = PROJECTS.filter((p) => projectMatchesStack(p, stack));
      return clone({
        query: stack || "(none — returning all)",
        count: matches.length,
        results: matches,
      });
    },

    /** The single strongest project to show off first. */
    get_featured_project() {
      const featured = PROJECTS.find((p) => p.featured) || PROJECTS[0];
      return clone(featured);
    },

    /** Safe, public contact info only. */
    get_contact_info() {
      return clone({
        github: CONTACT.github,
        linkedin: CONTACT.linkedin,
        email: CONTACT.email,
        twitter: CONTACT.twitter, // null = not provided (kept honest, not faked)
        preferredContact: CONTACT.preferredContact,
        note: CONTACT.note,
      });
    },

    /** A plain-language explanation of why this site is "agent-ready". */
    explain_why_agent_ready() {
      return clone({
        summary:
          "This portfolio exposes its content as structured, callable tools, so an AI agent doesn't have to scrape HTML or guess meaning from button labels.",
        how_it_works:
          "Tools are registered with the browser's WebMCP API (navigator.modelContext.registerTool). Each tool has a name, a description, an input schema, and a read-only safety hint.",
        tools: Object.keys(agentTools),
        fallback:
          "If a browser doesn't support WebMCP yet, the exact same tools stay available on window.agentTools and through the on-page demo panel.",
        learn_more: "https://webmachinelearning.github.io/webmcp/",
      });
    },
  };

  /* =================================================================
     3. WEBMCP ADAPTER  —  make the tools callable by AI agents
     -----------------------------------------------------------------
     WebMCP is an emerging browser API (W3C Web Machine Learning
     Community Group). A page registers "tools" that an in-browser AI
     agent can call directly — no scraping. The real API lives on
     navigator.modelContext (the spec also defines document.modelContext),
     so we feature-detect BOTH and fall back gracefully when neither
     exists. As of now the API ships behind a flag in Chrome Canary and
     via the @mcp-b/global polyfill, so most visitors will hit the
     fallback — and that's fine: the on-page demo still works.

     NOTE: real WebMCP support depends on the browser/agent environment,
     and the API requires a secure context (HTTPS or localhost).
     We never invent dangerous capabilities — every tool here is read-only.
     ================================================================= */

  // Metadata for each tool: this is what an agent reads to decide what to call.
  // inputSchema is a standard JSON Schema. annotations.readOnlyHint=true tells
  // the agent "this only reads data, it's always safe to call".
  const WEBMCP_TOOLS = [
    {
      name: "get_profile",
      description: "Get Himanshu Kumar's name, role, short bio, location, education, and interests.",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.get_profile(),
    },
    {
      name: "list_skills",
      description: "List Himanshu's skills grouped by category (Languages, Frontend, Backend, AI/ML, Tools).",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.list_skills(),
    },
    {
      name: "list_projects",
      description: "List all of Himanshu's projects with title, description, tech stack, tags, links, and a featured flag.",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.list_projects(),
    },
    {
      name: "filter_projects_by_stack",
      description:
        "Return the projects that use a given technology or stack. Examples: 'Python', 'FastAPI', 'Pyodide', 'TypeScript', 'AI'.",
      inputSchema: {
        type: "object",
        properties: {
          stack: { type: "string", description: "A technology or category to filter by, e.g. 'Python'." },
        },
        required: ["stack"],
      },
      run: (input) => agentTools.filter_projects_by_stack(input || {}),
    },
    {
      name: "get_featured_project",
      description: "Get the single strongest project to show a recruiter or visitor first.",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.get_featured_project(),
    },
    {
      name: "get_contact_info",
      description: "Get safe, public contact info: GitHub, LinkedIn, and email. Returns no private data.",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.get_contact_info(),
    },
    {
      name: "explain_why_agent_ready",
      description: "Explain, in plain language, why this portfolio is 'agent-ready' and how the WebMCP tools work.",
      inputSchema: { type: "object", properties: {} },
      run: () => agentTools.explain_why_agent_ready(),
    },
  ];

  // Wrap a plain result in the MCP-shaped envelope agents expect.
  function toMcpResult(value) {
    return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
  }

  // Feature-detect the WebMCP API without ever throwing.
  function getModelContext() {
    const fromNavigator = typeof navigator !== "undefined" ? navigator.modelContext : null;
    const fromDocument = typeof document !== "undefined" ? document.modelContext : null;
    const mc = fromNavigator || fromDocument || null;
    if (mc && typeof mc.registerTool === "function") return mc;
    return null;
  }

  /**
   * Try to register every tool with the real WebMCP API.
   * Returns a small status object the UI can display. Never throws.
   */
  function registerAgentTools() {
    const mc = getModelContext();

    if (!mc) {
      // Graceful fallback: no agent API in this browser. The demo panel
      // and window.agentTools still let humans (and test scripts) call the tools.
      return { registered: false, reason: "WebMCP API not detected", count: 0 };
    }

    let count = 0;
    for (const tool of WEBMCP_TOOLS) {
      try {
        mc.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: true }, // all our tools only READ data
          // The agent calls execute(); we run the matching tool and return MCP shape.
          async execute(input) {
            return toMcpResult(await tool.run(input));
          },
        });
        count += 1;
      } catch (err) {
        // A duplicate name or unsupported field shouldn't break the page.
        console.warn(`[WebMCP] Could not register "${tool.name}":`, err);
      }
    }
    return { registered: true, count };
  }

  /* =================================================================
     4. THE HUMAN SIDE  —  render the page and handle interactions
     ================================================================= */

  // Tiny escape helper so any text we inject as HTML stays safe.
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid) return;
    grid.innerHTML = Object.entries(SKILLS)
      .map(([group, items]) => {
        const badges = items.map((s) => `<li class="badge">${esc(s)}</li>`).join("");
        return `
          <article class="skill-card">
            <h3>${esc(group)}</h3>
            <ul class="badges">${badges}</ul>
          </article>`;
      })
      .join("");
  }

  // Curated filter chips. "All" plus a few stacks that yield nice subsets.
  const FILTERS = ["All", "Python", "JavaScript", "TypeScript", "FastAPI", "AI", "Browser AI"];
  let activeFilter = "All";

  function renderFilters() {
    const wrap = document.getElementById("project-filters");
    if (!wrap) return;
    wrap.innerHTML = FILTERS.map(
      (f) =>
        `<button class="filter${f === activeFilter ? " is-active" : ""}" data-filter="${esc(f)}" type="button">${esc(f)}</button>`
    ).join("");
  }

  function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const visible =
      activeFilter === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => projectMatchesStack(p, activeFilter));

    if (visible.length === 0) {
      grid.innerHTML = `<p class="section-sub">No projects match "${esc(activeFilter)}" yet.</p>`;
      return;
    }

    grid.innerHTML = visible
      .map((p) => {
        const stack = p.stack.map((s) => `<li class="stack-pill">${esc(s)}</li>`).join("");
        const demo = p.links.demo
          ? `<a href="${esc(p.links.demo)}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`
          : "";
        const github = p.links.github
          ? `<a class="${p.links.demo ? "muted" : ""}" href="${esc(p.links.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
          : "";
        return `
          <article class="project-card${p.featured ? " is-featured" : ""}">
            ${p.featured ? '<span class="featured-flag">Featured</span>' : ""}
            <h3>${esc(p.title)}</h3>
            <p class="project-desc">${esc(p.description)}</p>
            <ul class="project-stack">${stack}</ul>
            <div class="project-links">${demo}${github}</div>
          </article>`;
      })
      .join("");
  }

  function wireFilters() {
    const wrap = document.getElementById("project-filters");
    if (!wrap) return;
    wrap.addEventListener("click", (event) => {
      const btn = event.target.closest(".filter");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      renderFilters();
      renderProjects();
    });
  }

  function wireThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    const icon = toggle.querySelector(".theme-toggle-icon");
    const root = document.documentElement;

    // Restore the saved choice (defaults to the dark theme set in the HTML).
    const saved = safeGet("theme");
    if (saved) root.setAttribute("data-theme", saved);
    const syncIcon = () => {
      if (icon) icon.textContent = root.getAttribute("data-theme") === "light" ? "☀️" : "🌙";
    };
    syncIcon();

    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      safeSet("theme", next);
      syncIcon();
    });
  }

  function wireCopyContact() {
    const btn = document.getElementById("copy-contact");
    const status = document.getElementById("copy-status");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const email = btn.dataset.email || CONTACT.email;
      try {
        await navigator.clipboard.writeText(email);
        if (status) status.textContent = "Copied " + email;
      } catch {
        // Clipboard API can be blocked (e.g. opening via file:// in some browsers).
        if (status) status.textContent = "Couldn't copy — email is " + email;
      }
      if (status) setTimeout(() => (status.textContent = ""), 2600);
    });
  }

  /* ---------- The demo panel: let humans call the agent tools ---------- */

  function runToolInPanel(name, args) {
    const output = document.getElementById("tool-output");
    const label = document.getElementById("tool-output-label");
    if (!output) return;

    const tool = agentTools[name];
    if (typeof tool !== "function") {
      output.textContent = `Unknown tool: ${name}`;
      return;
    }

    // Show the call the way an agent would express it.
    const argText = args && Object.keys(args).length ? JSON.stringify(args) : "";
    if (label) label.textContent = `// agentTools.${name}(${argText})`;

    try {
      const result = tool(args || {});
      output.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
      output.textContent = `Error: ${err && err.message ? err.message : String(err)}`;
    }
  }

  function wireDemoPanel() {
    // Tool buttons (each carries data-tool and optional data-args JSON).
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let args = {};
        if (btn.dataset.args) {
          try {
            args = JSON.parse(btn.dataset.args);
          } catch {
            args = {};
          }
        }
        runToolInPanel(btn.dataset.tool, args);
      });
    });

    // The "try any stack" form → filter_projects_by_stack({ stack }).
    const form = document.getElementById("stack-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("stack-input");
        const stack = input ? input.value.trim() : "";
        runToolInPanel("filter_projects_by_stack", { stack });
      });
    }

    // Copy the current JSON output (handy for pasting into an agent chat).
    const copyBtn = document.getElementById("copy-output");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const output = document.getElementById("tool-output");
        if (!output) return;
        try {
          await navigator.clipboard.writeText(output.textContent || "");
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = "Copy JSON"), 1600);
        } catch {
          copyBtn.textContent = "Press Ctrl+C";
          setTimeout(() => (copyBtn.textContent = "Copy JSON"), 1600);
        }
      });
    }
  }

  function updateWebmcpStatus(result) {
    const el = document.getElementById("webmcp-status");
    if (!el) return;
    if (result.registered) {
      el.dataset.state = "ok";
      el.textContent = `WebMCP detected — ${result.count} tools registered for agents on this page.`;
    } else {
      el.dataset.state = "fallback";
      el.textContent =
        "No WebMCP browser detected — the local demo below calls the exact same tools, so everything still works.";
    }
  }

  /* =================================================================
     5. INIT
     The <script> tag uses defer, so the DOM is ready when we run.
     ================================================================= */

  function init() {
    // Footer year
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Render the human-facing UI
    renderSkills();
    renderFilters();
    renderProjects();

    // Wire interactions
    wireFilters();
    wireThemeToggle();
    wireCopyContact();
    wireDemoPanel();

    // Expose tools for demos, testing, and curious devs in the console.
    window.agentTools = agentTools;
    window.portfolioData = { profile: PROFILE, skills: SKILLS, projects: PROJECTS, contact: CONTACT };

    // Try to register tools with the real WebMCP API, then report status.
    const status = registerAgentTools();
    updateWebmcpStatus(status);

    // A friendly nudge for anyone who opens DevTools.
    console.info(
      "%cThis portfolio is agent-ready 🤖",
      "font-weight:bold;font-size:13px;",
      "\nTry: agentTools.get_featured_project()  •  agentTools.filter_projects_by_stack({ stack: 'Python' })"
    );
  }

  init();
})();
