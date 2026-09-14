# Multi-Agent Team Playbook — Agile Autonomous Framework

This playbook establishes a collaborative, autonomous operating loop between five specialized agent roles to build and maintain high-grade software products.

---

## 🚦 Dynamic Decision Matrix (System Autonomy)

The user should never have to manually specify when to trigger a sprint or which role to activate. The system automatically classifies incoming requests into one of three operating tracks:

| Operating Track | Typical Triggers | Roles Involved | Overhead / Documentation |
| :--- | :--- | :--- | :--- |
| **Mode 1: Surgical Focus** *(Fast-Track)* | Targeted bugfixes, calculations/invariants, copy/typo tweaks, linter fixes, failing unit tests. | **Principal Engineer** (direct, exclusive control). | **Zero bureaucracy.** No sprint doc. Atomic modification + verification (typecheck + tests). |
| **Mode 2: Tactical Duo** *(UX + Engineering)* | Component redesign, new modals/sheets, ergonomics & touch targets, visual charts. | **Product Designer** + **Principal Engineer** (+ QA check). | **Lightweight.** Plan outlined directly in chat. No sprint doc unless touching database schema. |
| **Mode 3: Full Sprint Playbook** | Major backlog feature, database schema migrations, complex business workflows. | **PM Orchestrator** leading all 5 phases. | **Formal.** Tracked via sprint spec in `docs/sprints/SPRINT-XXX-<slug>.md`. |

---

## 🤖 Sub-Agent Autonomy: When to Parallelize vs. When to Keep Focus

The PM Orchestrator and Principal Engineer decide when to spawn sub-agents (e.g. browser subagents, background jobs) under a golden rule:

> **"Atomic focus on domain logic; parallel hands on exploration and verification."**

### 🟢 When to Parallelize (Sub-Agents / Background Tasks):
1. **Autonomous QA & Navigation (`browser_subagent`):**
   - After completing UI or workflow changes, dispatch a browser sub-agent to navigate the app, stress-test inputs, audit mobile viewports (e.g., 375px/390px), and report unhandled console errors or layout shifts.
2. **Exploratory Research & Benchmarking:**
   - Investigate industry references (Linear, Stripe, Notion, Obsidian) or analyze external API documentation without polluting the core technical context.
3. **Accessibility (a11y) & Performance Audits:**
   - Execute contrast ratios, accessibility tree reviews, or re-render profiling asynchronously.

### 🔴 When to Keep STRICT ATOMIC FOCUS (Single-thread, No Sub-Agents):
1. **Domain Logic & State Invariants:**
   - Core business logic, central state stores, and data integrity require strict sequential reasoning. Fragmenting domain logic across parallel subagents risks race conditions and contradictory code.
2. **Database Schemas & Migrations:**
   - Schema foundations, migrations, and Row-Level Security (RLS) policies must be designed and validated by a single technical mind to guarantee idempotence.
3. **Core Architectural Refactoring:**
   - Global context, cache providers, and store synchronization require end-to-end coherence.

---

## 🔄 The 5-Phase Sprint Feedback Loop

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

### Phase 1: Briefing & Alignment (PM Orchestrator)
- **Input:** Backlog item or user requirement.
- **Action:** Initializes `docs/sprints/SPRINT-XXX-<slug>.md` using `SPRINT_SPEC_TEMPLATE.md`.
- **Output:** Clear problem statement, target personas, and measurable success criteria.

### Phase 2: Benchmarking & Research (Market Researcher)
- **Action:** Analyzes how world-class products solve similar problems.
- **Output:** Populates `[1. RESEARCH & BENCHMARKS]` with proven interaction patterns, risk warnings, and domain edge cases.

### Phase 3: World-Class Experience Design (Product Designer)
- **Action:** Specifies visual anatomy, semantic tokens, micro-interactions, responsive behavior, and tactile ergonomics.
- **Output:** Populates `[2. DESIGN SPEC]` detailing interactive states, touch targets (≥ 44px), and animations.

### Phase 4: Architecture & Implementation (Principal Engineer)
- **Action:** Implements clean, modular, strictly typed code adhering to domain invariants.
- **Mandatory Verification:** Clean compilation and tests (`npm test` / build checks).
- **Output:** Populates `[3. TECH ARCHITECTURE]` and hands off the build for QA.

### Phase 5: Relentless Audit (Rigorous QA Auditor)
- **Action:** Inspects via browser tools/sub-agents, evaluates mobile viewports, checks console cleanliness, and audits accessibility.
- **Correction Loop:** If friction or regressions are detected, routes the issue back to Design or Engineering with reproduction steps.
- **Output:** Grants signoff (`[4. QA SIGNOFF]`) only when 100% clean.

---

## 🧠 Continuous Learning Protocol (Knowledge Feeder)

At the conclusion of each cycle:
1. **New UI or input discoveries:** Documented into relevant design/form skills.
2. **Superior architectural patterns:** Documented as an Architectural Decision Record (ADR).
3. **No bug or friction is solved twice:** Converted into a permanent project rule in `AGENTS.md`.
