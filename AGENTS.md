# Global Agent Instructions — [PROJECT_NAME]

---

## Language & Communication

- Code, variables, functions, and technical comments: **in English**.
- Conversations, product documentation, and architecture decisions: **[Specify Language, e.g., English or Spanish]**.

---

## General Behavior & Operating Principles

1. **Plan before executing.** Present a clear plan before modifying code or architecture on any non-trivial task. Wait for confirmation.
2. **Ask when genuinely ambiguous.** Do not guess. If there are multiple viable interpretations, clarify first.
3. **Simple solutions that scale.** Avoid over-engineering. The simplest solution that reliably solves the problem and can grow is the right one.
4. **Document important decisions.** Record architectural deviations, patterns, and new standards in documentation.
5. **Never break what already works.** Understand full blast radius before refactoring.
6. **Dynamic Operating Modes:** The user should never need to manually specify what role or framework to trigger. The agent dynamically classifies requests between:
   - *(a) Surgical Focus / Fast-Track:* Direct Principal Engineer intervention for bugfixes, invariants, and minor tweaks (zero paperwork).
   - *(b) Tactical Duo:* Product Designer + Principal Engineer for component/modal redesigns.
   - *(c) Full Sprint Playbook:* PM Orchestrator leading the 5-phase loop for backlog features or structural changes.
   See [.agents/TEAM_PLAYBOOK.md](file:///.agents/TEAM_PLAYBOOK.md).
7. **Sub-Agent Autonomy (Parallelization vs. Atomic Focus):** Golden rule: *"Atomic focus on domain logic; parallel hands on exploration and verification"*. Dispatch sub-agents (browser testing in mobile viewports, benchmarks) autonomously, but preserve single-threaded atomic focus on state management, core business rules, and database schemas.

---

## Tech Stack & Architecture

> Configure your project stack below:

- **Frontend:** [e.g., React / Next.js / Vue / Svelte]
- **Backend / DB:** [e.g., PostgreSQL / MySQL / Node.js / Go / Python]
- **Styling:** [e.g., Tailwind CSS / CSS Modules]
- **Forms & Validation:** [e.g., React Hook Form + Zod]
- **Testing:** [e.g., Vitest / Jest / Playwright]

---

## Non-Negotiable Best Practices

- **Zero Tolerance for Broken Builds:** Validate every code change with your project's typechecker and test runner (e.g., `npm run build && npm test`).
- **Controlled Inputs:** Every form input must have a defined initial value (e.g. `""`, never `undefined`) to avoid uncontrolled-to-controlled warnings.
- **Security First:** Always validate and sanitize inputs at application boundaries. Enforce strict authorization and never expose private keys or secrets.
- **Mobile First & Ergonomics:**
  - Minimum interactive tap target of **44×44px**.
  - Visible focus rings for keyboard navigation.
  - No horizontal page overflow on small screens (375px/390px).

---

## Git Discipline — Commits & Pushes

> [!CAUTION]
> **NEVER execute git commits or pushes without explicit verbal authorization from the user for EACH action.**

- **No Inferred Permissions:** Prior approval of a task or previous commit never implies permission for future commits.
- **Task Words Are NOT Commit Permission:** Words like *"looks good"*, *"ok"*, *"proceed"*, *"go ahead"* mean **implement code only**, NEVER run `git commit` or `git push`.
- **Descriptive, Structured Commit Messages:** Meaningful title following Conventional Commits, accompanied by a structured body detailing what changed across modules.
