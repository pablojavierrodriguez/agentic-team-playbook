# ⚡ Agentic Team Playbook

> **Autonomous multi-agent agile framework for modern software development with dynamic modes, decoupled releases, and sub-agent orchestration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/pablojavierrodriguez/agentic-team-playbook/pulls)
[![Architecture: Multi--Agent](https://img.shields.io/badge/Architecture-Multi--Agent-purple.svg)]()
[![Focus: Zero--Bureaucracy](https://img.shields.io/badge/Focus-Zero--Bureaucracy-orange.svg)]()

---

## 🎯 The Dilemma: Chaos vs. Bureaucracy

When pair-programming with AI coding agents (Claude Code, Cursor, Antigravity, Copilot Workspace), development teams usually hit one of two extremes:

1. **Cowboy Coding (Chaos):** The agent jumps straight to hacking code, skips architecture, breaks mobile responsiveness, introduces subtle type errors, and makes vague commits.
2. **Analysis Paralysis (Over-Engineering):** The agent asks questions at every step, opens a 10-page specification doc for a 2-line typo fix, and requires the user to manually act as an exhausted Scrum Master.

**Agentic Team Playbook** solves this by establishing an **autonomous, self-governing multi-agent system** that dynamically selects the right gear according to task complexity.

---

## 🧠 Under the Hood: Why "Agents" are Modular Skills (Not Daemon Swarms)

A widespread misconception in AI-assisted development is that a "multi-agent team" requires running 5 independent LLM background processes communicating in an open-ended chat loop (e.g. CrewAI, AutoGen).

In real-world software engineering, autonomous background swarms fail due to three critical pitfalls:
1. **Git & State Collisions:** Concurrent processes modifying the same codebase lead to race conditions, overwritten code, and corrupted branch histories.
2. **Context Bloat & Token Explosion:** Inter-agent chit-chat rapidly inflates context windows and multiplies API costs by 5x–10x with massive latency.
3. **Hallucinatory Feedback Loops:** When one agent assumes an obsolete API or invalid type, subsequent agents validate it and build tests on top of false premises.

### The Architecture: Role-Swapping via Progressive Disclosure

The **Agentic Team Playbook** replaces chaotic swarms with a battle-tested pattern: **A Single Host Agent with Modular, Lazy-Loaded Skills**.

```
                   ┌──────────────────────────────────────────────┐
                   │           HOST AGENT (Active Model)          │
                   │    (Antigravity / Cursor / Claude Code)      │
                   └──────────────────────┬───────────────────────┘
                                          │
                  Assumes specialized operational "hats" on demand
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   [ principal-engineer ]       [ rigorous-qa-auditor ]      [ worldclass-designer ]
   • Strict TypeScript (0 any)  • Verification Pyramid       • 44px touch ergonomics
   • 60 FPS Kanban rendering    • tsc + headless tests       • Semantic token system
   • Deterministic Markdown/MCP • Zero unrequested commits   • Micro-animations
```

* **The Host Agent:** Your coding assistant acts as the sole execution engine interacting with your codebase.
* **Skills as Contextual Hats:** Each role in `.agents/skills/` is a high-density, prompt-engineered operational manual. When moving an item from `doing` to `review`, the agent temporarily assumes the constraints of the `rigorous-qa-auditor`. It loads only the rules it needs, keeping the context clean.
* **Deterministic Single Thread for Code:** All domain logic, schema migrations, and Git modifications are executed by a single mind in strict sequence to prevent race conditions.
* **Ephemeral Sub-Agents Strictly for Non-State Operations:** True parallel sub-agents are reserved exclusively for side-car tasks that cannot corrupt state (e.g. headless browser audits with `browser_subagent` or web benchmarking).

### ⚖️ Architectural Comparison: Swarms vs. Playbook

| Dimension | Autonomous Swarms (CrewAI / AutoGen) | Agentic Team Playbook (Skills + Single Host) |
| :--- | :--- | :--- |
| **Execution Engine** | Multiple uncoordinated background bots | 1 Host Agent wearing specialized role hats sequentially |
| **Token Economy** | 🔴 High (wasteful inter-agent chat) | 🟢 Surgical (progressive disclosure of context) |
| **Git & File Safety** | 🔴 High risk of merge conflicts & races | 🟢 100% deterministic, single-threaded file mutations |
| **Quality Gate** | "LLM grading another LLM" (hallucinatory) | **Mechanical Verification Pyramid** (`tsc`, tests, linters) |
| **Human Governance** | 🔴 Opaque "black box" execution | 🟢 PO Sovereignty (exclusive authority on commits & releases) |

---

## 🚦 Dynamic Decision Matrix (3 Operating Modes)

The developer never has to manually specify *"activate the designer"* or *"open a sprint"*. The system classifies requests autonomously:

```
                  ┌─────────────────────────────────────┐
                  │          DEVELOPER PROMPT           │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   [ MODE 1: FOCUS ]        [ MODE 2: DUO ]          [ MODE 3: SPRINT ]
   Surgical Fast-Track       Tactical UX + Code       Full Agile Delivery Loop
   ───────────────────────   ─────────────────────   ──────────────────────────
   • Targeted bugfixes       • Component redesign    • Strategic backlog epics
   • Calculation fixes       • Modals & sheets       • Database migrations
   • Linters & unit tests    • Touch targets (≥44px) • Multi-step workflows
   ───────────────────────   ─────────────────────   ──────────────────────────
   Lead: Principal Eng.      Lead: Designer + Eng.   Lead: PO / PM Orchestrator
   Zero paperwork            Lightweight chat plan   Formal delivery pipeline
   Atomic verification       Quick visual QA         Verification Pyramid
```

---

## 🤖 Sub-Agent Autonomy: The Golden Rule

> **"Atomic focus on domain logic; parallel hands on exploration and verification."**

### 🟢 When to Parallelize (Spawn Sub-Agents):
- **Visual Layout Auditing (`browser_subagent`):** Reserved exclusively for visual layout/CSS issues not deducible statically, complex responsive rendering, or upon explicit user request.
- **Exploratory Benchmarking:** Research industry standards (Linear, Stripe, Notion) without cluttering the active codebase context.
- **Accessibility & Performance Auditing:** Automated WCAG 2.1 AA checks and render profilers.

### 🔴 When to Keep Atomic Single-Thread Focus:
- **Core Domain Logic & State Invariants:** State mutations and critical business invariants demand deterministic, single-threaded execution to prevent race conditions.
- **Database Schema & Migrations:** Schema foundations and RLS policies must be authored by a single architectural mind.
- **Global State Management & Parsers:** Context providers, local persistence caches, and backlog parsers require complete end-to-end consistency.

---

## 🔄 The Agile Delivery Flow (The 5 Phases)

For strategic features and backlog epics (Mode 3), the team orchestrates a rigorous, value-driven feedback loop:

```
       [ 1. Discovery & PM ] (pm-orchestrator)
                 │
                 ▼
       [ 2. Market Research ] (market-researcher) ◄──────────┐
                 │                                            │ (UX Adjustments /
                 ▼                                            │  Edge cases)
       [ 3. Design & Motion ] (worldclass-product-designer)   │
                 │                                            │
                 ▼                                            │
       [ 4. Dev Execution ] (principal-engineer) ─────────────┘
                 │ status: doing ➔ review
                 ▼
       [ 5. QA Sentinel & Audit ] (rigorous-qa-auditor)
                 │ status: review ➔ ready (Formal Handover)
                 ▼
       [ Release Management & Prod ] (PO + Delivery Lead)
                 │ status: ready ➔ done (Deployed to Prod)
                 ▼
          [ Knowledge Feeder ] ──► [ Feedback to Rules / Skills ]
```

1. **PM Orchestrator / PO:** Initializes `docs/sprints/SPRINT-XXX.md` (or backlog task), defines problem scope, target user, and acceptance criteria.
2. **Market Researcher:** Identifies UX benchmarks, anti-patterns, and domain edge cases from industry leaders.
3. **World-Class Product Designer:** Defines visual hierarchy, semantic color tokens, 44px touch ergonomics, and micro-interactions.
4. **Principal Engineer (Dev Execution):** Delivers modular, strictly typed code adhering to domain invariants. Ticks acceptance criteria in real time (`- [x]`). At completion, sets task status to `review`.
5. **Rigorous QA Auditor (QA Gate):** Audits under the **Verification Pyramid** (`tsc` ➔ headless tests ➔ backlog check ➔ build). Once verified, marks the item as `ready`.
   - **`ready` is the formal delivery of development:** The item is certified and immediately available for release packaging.
6. **Release Management (PO + Scrum/Delivery Lead):** Assembles release packages based strictly on **delivered value** from all available `ready` items (historical or current).
   - **Decoupled Sprints & Releases:** Sprints and releases have no 1:1 coupling. Releases are created based on delivered value, with or without an active sprint.
   - **Production Deployment (`ready` ➔ `done`):** Upon deploying to production (main cloud), packaged items transition to `done`.
   - **Fundamental Invariant:** **No item can exist in production that is not in `done`**.
7. **Sprint Timebox & Continuous Productivity (PO Sovereignty):**
   - Sprints finish by timebox (fixed duration), regardless of progress. Uncompleted items are replanned.
   - If items complete early, the PO expands scope with refined backlog items to maintain productivity.
   - The agent **NEVER** closes a sprint or executes a retrospective autonomously; only upon explicit textual command from the PO.
8. **Knowledge Feeder:** Feeds lessons learned back into permanent project rules so no mistake is repeated twice.

---

## 📂 Repository Anatomy

```text
├── .agents/
│   ├── TEAM_PLAYBOOK.md          # Dynamic modes, subagent criteria & 5-phase loop
│   ├── rules/
│   │   └── git-workflow.md       # Strict verbal commit permissions & atomic messaging
│   └── skills/
│       ├── pm-orchestrator/SKILL.md             # Sprint leadership & DoD
│       ├── market-researcher/SKILL.md           # Benchmarking & edge cases
│       ├── worldclass-product-designer/SKILL.md # UI design system & touch ergonomics (≥44px)
│       ├── principal-engineer/SKILL.md          # Architecture, strict typing & fast-track
│       ├── rigorous-qa-auditor/SKILL.md         # A11y, mobile viewport & QA signoff
│       ├── code-level-ux-auditor/SKILL.md       # Static anti-patterns auditor (scroll, keyboards, janks)
│       ├── mobile-ux-design/SKILL.md            # Touch targets, safe areas & sheets
│       ├── forms-rhf-zod/SKILL.md               # Controlled inputs, numeric parsing & schemas
│       ├── pwa-assets-audit/SKILL.md            # Manifest, icons & offline compliance
│       ├── recharts-reporting/SKILL.md          # Responsive data visualizations & KPIs
│       └── ui-radix-tailwind/SKILL.md           # Accessible primitive UI components
├── scripts/
│   └── audit-ux-code.cjs         # CLI tool: scans src/ for 8 static mobile UX anti-patterns
├── docs/
│   └── sprints/
│       └── SPRINT_SPEC_TEMPLATE.md # Universal sprint runbook template
├── AGENTS.md                     # Master project instructions template
├── LICENSE                       # MIT License
└── README.md                     # This guide
```

---

## 🚀 Quickstart: Drop into ANY Project (60 Seconds)

This framework is **100% agnostic** of language, stack, and industry.

### Option A: Project-Level Installation (Recommended)

1. Clone or copy `.agents/`, `docs/`, and `AGENTS.md` into the root of your project:
   ```bash
   git clone https://github.com/pablojavierrodriguez/agentic-team-playbook.git temp-playbook
   cp -r temp-playbook/.agents temp-playbook/docs temp-playbook/AGENTS.md ./
   rm -rf temp-playbook
   ```
2. Open `AGENTS.md` and customize:
   - **Stack:** Define your tools (e.g. Next.js, FastAPI, Go, Tailwind, PostgreSQL).
   - **Invariants:** Add any strict domain rules (e.g. data validation, RBAC, access policies).
3. Start prompting your AI agent naturally. The system will self-select the right mode automatically!

### Option B: Global Installation (Available across all workspaces)

For environments like Antigravity IDE:
- Copy the skills from `.agents/skills/` into your global config directory:
  `~/.gemini/config/skills/`
- Every repository you open will immediately inherit the 5 specialized agent roles.

### Option C: Universal One-Command Sync with `gripm` (Zero-Clone)

If you have Node.js installed, you can initialize or update the latest Playbook standard into **ANY repository** (React, Python, Go, Rust, Swift) without cloning:

```bash
npx gripm playbook sync
```

* **Separation of Layers:** Safely installs and updates `.agents/skills/*` and core rules.
* **Preservation Guarantee:** Strictly leaves your custom `AGENTS.md` and local backlog intact.

---

## 🔌 Supercharging Your Team with Official MCP Servers

While this framework works standalone with any standard AI coding assistant, pairing it with official **Model Context Protocol (MCP)** servers gives your virtual team specialized real-world superpowers:

| Role | Recommended Official MCP | Superpower Unlocked |
| :--- | :--- | :--- |
| **PM Orchestrator & Principal Engineer** | **GitHub MCP** (`@modelcontextprotocol/server-github`) | Read backlog issues, inspect PR diffs, check commit histories, and draft releases directly from the repository. |
| **Rigorous QA Auditor** | **Chrome DevTools / Puppeteer MCP** (`@modelcontextprotocol/server-puppeteer`) | Autonomous browser navigation, mobile viewport resizing (375px), a11y auditing, and console error detection. |
| **Principal Engineer** | **Postgres / Database MCP** (`@modelcontextprotocol/server-postgres`) | Live schema inspection, migration verification, and query optimization without leaving the terminal. |
| **All Roles** | **Filesystem MCP** (`@modelcontextprotocol/server-filesystem`) | High-speed directory traversal and workspace indexing for massive monorepos. |

> [!TIP]
> **Security Best Practice:** Always configure MCP servers in your private local IDE/client settings (e.g. `~/.gemini/config/mcp_config.json`, Claude Desktop config, or Cursor settings). **Never commit personal access tokens, database connection strings, or private keys to your project repositories.**

---

## 🇪🇸 Resumen en Español

**Agentic Team Playbook** es un framework de gobernanza y desarrollo ágil multi-agente para transformar asistentes de IA en un equipo de ingeniería de alto rendimiento:

- **Autonomía sin burocracia:** Clasificación dinámica entre *Foco Quirúrgico* (fixes directos sin papeleo), *Dúo Táctico* (UX + Código) y *Sprint & Backlog Flow* (flujo ágil formal de entrega).
- **Patrón Role-Swapping (Bajo el Capó):** En lugar de enjambres caóticos que queman tokens y colisionan en Git, un único Host Agent adopta skills modulares bajo demanda (*progressive disclosure*). Subagentes paralelos reservados exclusivamente para validaciones sin estado (browser headless o benchmarking).
- **Flujo Ágil Canónico (Dev ➔ QA ➔ Release Management ➔ Prod):** Los desarrollos se entregan formalmente en `ready` (el dev implementa en `doing` y pasa a `review`; QA audita y formaliza la entrega en `ready`). Release Management agrupa ítems en `ready` por valor entregado para armar versiones. Al desplegar a producción (main cloud), pasan a `done`.
- **Invariante Fundamental:** No puede haber un ítem en producción que no esté en `done`.
- **Desacople Sprint vs. Release:** Los releases se arman exclusivamente por valor entregado con ítems disponibles en `ready`, con o sin sprint activo, con ítems históricos o del sprint en curso.
- **Sprints Timeboxeados y Soberanía del PO:** El sprint concluye por vencimiento del timebox (duración fija). Si los ítems se entregan antes, el PO amplía el alcance con nuevos ítems del backlog para mantener la productividad continua. Prohibido cerrar sprints o ejecutar retros por deducción propia (solo por orden textual explícita del PO).
- **Pirámide de Verificación (Cero Desperdicio):** `tsc` ➔ `npm test` ➔ `backlog/spec check` ➔ `build`. Browser subagents reservados exclusivamente para CSS/layouts visuales no deducibles estáticamente.
- **Sincronización Universal sin Clonar:** Cualquier repositorio puede instalar o actualizar las skills oficiales ejecutando `npx gripm playbook sync`, preservando al 100% tu `AGENTS.md` particular.
- **Drop-in universal:** Funciona en cualquier tecnología (React, Vue, Node, Python, Go, Swift) copiando la carpeta `.agents/` a tu repositorio.
- **Potenciación con MCP Oficiales:** Compatible con servidores MCP (GitHub, Puppeteer/DevTools, PostgreSQL) configurados en tu entorno local.

---

## 📜 License

Distributed under the [MIT License](LICENSE). Free for personal and commercial use.
Authored by [Pablo Javier Rodríguez](https://github.com/pablojavierrodriguez).
