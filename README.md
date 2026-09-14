# ⚡ Agentic Team Playbook

> **Autonomous multi-agent agile framework for modern software development with dynamic modes and sub-agent orchestration.**

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
   Surgical Fast-Track       Tactical UX + Code       Full 5-Phase Playbook
   ───────────────────────   ─────────────────────   ──────────────────────
   • Targeted bugfixes       • Component redesign    • Strategic backlog epics
   • Calculation fixes       • Modals & sheets       • Database migrations
   • Linters & unit tests    • Touch targets (≥44px) • Multi-step workflows
   ───────────────────────   ─────────────────────   ──────────────────────
   Lead: Principal Eng.      Lead: Designer + Eng.   Lead: PM Orchestrator
   Zero paperwork            Lightweight chat plan   Formal sprint runbook
   Atomic verification       Quick visual QA         Browser subagent in QA
```

---

## 🤖 Sub-Agent Autonomy: The Golden Rule

> **"Atomic focus on domain logic; parallel hands on exploration and verification."**

### 🟢 When to Parallelize (Spawn Sub-Agents):
- **Autonomous Browser QA (`browser_subagent`):** Navigate mobile viewports (375px/390px), stress-test inputs, and detect unhandled console errors or layout shifts asynchronously.
- **Exploratory Benchmarking:** Research industry standards (Linear, Stripe, Notion) without cluttering the active codebase context.
- **Accessibility & Performance Auditing:** Automated WCAG 2.1 AA checks and render profilers.

### 🔴 When to Keep Atomic Single-Thread Focus:
- **Core Domain Logic & Accounting:** State mutations and financial invariants demand deterministic, single-threaded execution to prevent race conditions.
- **Database Schema & Migrations:** Schema foundations and RLS policies must be authored by a single architectural mind.
- **Global State Management:** Context providers and local persistence caches.

---

## 🔄 The 5-Phase Sprint Loop

For strategic features (Mode 3), the team orchestrates a rigorous feedback loop:

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
       [ 4. Engineering & Build ] (principal-engineer)        │
                 │                                            │
                 ▼                                            │
       [ 5. QA Sentinel & Audit ] (rigorous-qa-auditor) ──────┘
                 │
                 ▼ (Unanimous Signoff)
          [ Sprint Demo ] ──► [ Feedback to Rules / Skills ]
```

1. **PM Orchestrator:** Initializes `docs/sprints/SPRINT-XXX.md`, defines problem scope, target user, and Definition of Done.
2. **Market Researcher:** Identifies UX benchmarks, anti-patterns, and domain edge cases from industry leaders.
3. **World-Class Product Designer:** Defines visual hierarchy, semantic color tokens, 44px touch ergonomics, and micro-interactions.
4. **Principal Engineer:** Delivers modular, strictly typed code with zero compilation errors (`tsc` / `build` checks).
5. **Rigorous QA Auditor:** Audits mobile responsiveness, console cleanliness, keyboard navigation, and approves the release.
6. **Knowledge Feeder:** Feeds lessons learned back into permanent project rules so no mistake is repeated twice.

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
│       ├── worldclass-product-designer/SKILL.md # UI design system & touch ergonomics
│       ├── principal-engineer/SKILL.md          # Architecture, strict typing & fast-track
│       └── rigorous-qa-auditor/SKILL.md         # A11y, mobile viewport & QA signoff
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
   - **Invariants:** Add any strict domain rules (e.g. currency formatting, RBAC).
3. Start prompting your AI agent naturally. The system will self-select the right mode automatically!

### Option B: Global Installation (Available across all workspaces)

For environments like Antigravity IDE:
- Copy the skills from `.agents/skills/` into your global config directory:
  `~/.gemini/config/skills/`
- Every repository you open will immediately inherit the 5 specialized agent roles.

---

## 🇪🇸 Resumen en Español

**Agentic Team Playbook** es un framework de gobernanza y desarrollo multi-agente para transformar asistentes de IA en un equipo de ingeniería de alto rendimiento:

- **Autonomía sin burocracia:** Clasificación dinámica entre *Foco Quirúrgico* (fixes directos sin papeleo), *Dúo Táctico* (UX + Código) y *Sprint Playbook* (épicas del backlog).
- **Subagentes inteligentes:** Delega autónomamente tareas paralelas a subagentes (navegación y QA en mobile 375px) mientras preserva foco atómico secuencial en modelos de datos y cálculos de negocio.
- **Drop-in universal:** Funciona en cualquier tecnología (React, Vue, Node, Python, Go, Swift) copiando la carpeta `.agents/` a tu repositorio.

---

## 📜 License

Distributed under the [MIT License](LICENSE). Free for personal and commercial use.
Authored by [Pablo Javier Rodríguez](https://github.com/pablojavierrodriguez).
