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
6. **Agile Delivery Flow (Dev ➔ QA ➔ Release Management ➔ Prod):**
   > The delivery status vocabulary lives in **[.agents/STATE_MACHINE.md](.agents/STATE_MACHINE.md)**. There are exactly four statuses: `doing`, `review`, `ready`, `done`. **The backlog is not a status** — an item with no status simply has not entered the flow. **Refinement is a gate (R1), not a state.** Read the state machine before touching any status; never invent intermediate states.
   - **Dev (`doing` ➔ `review`):** Implements code and checks acceptance criteria (`- [x]`). At completion, transitions task to `review`.
   - **QA (`review` ➔ `ready`):** Audits under the Verification Pyramid. Transitions to `ready` as the **formal handover of development**. This transition is exclusive to the QA role: a developer never self-certifies.
   - **Release Management (PO + Scrum/Delivery Lead):** Assembles releases by **delivered value** from all available `ready` items (historical or current).
   - **Production Deployment (`ready` ➔ `done`):** Deployed package items become `done`. Marking `done` without an actual deploy is a state lie.
   - **Fundamental Invariant:** **No item can exist in production that is not in `done`**.
7. **Decoupled Sprints & Releases:** Sprints and releases have no 1:1 coupling. Releases are created based on delivered value with any available `ready` items, with or without an active sprint.
8. **Sprint Lifecycle & PO Sovereignty:** Sprints are fixed timeboxes. If items complete before the timebox expires, the PO expands scope with refined backlog items to prevent idle gaps. Sprints rarely conclude prematurely. The agent NEVER closes a sprint or triggers a retrospective by deduction; only upon explicit textual command from the PO.
9. **Dynamic Operating Modes:** The user should never need to manually specify what role or framework to trigger. The agent dynamically classifies requests between:
   - *(a) Mode 1: Surgical Focus / Fast-Track:* Direct Principal Engineer intervention for bugfixes, invariants, and minor tweaks (zero paperwork).
   - *(b) Mode 2: Tactical Duo:* Product Designer + Principal Engineer for component/modal redesigns.
   - *(c) Mode 3: Full Backlog & Sprint Flow:* Full agile delivery loop for backlog features or structural changes.
   See [.agents/TEAM_PLAYBOOK.md](.agents/TEAM_PLAYBOOK.md) for the role matrix and sub-agent criteria.
10. **Sub-Agent Autonomy:** Golden rule: *"Atomic focus on domain logic; parallel hands on exploration and verification"*. Dispatch sub-agents for benchmarks or non-blocking research, while preserving strict single-threaded focus on domain rules, schemas, and state invariants.

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

- **The Verification Pyramid (Zero-Waste Testing):**
  Validate every code change in strict order:
  1. Strict typechecking (e.g. `tsc --noEmit`, 0 errors).
  2. Headless unit & integration tests (e.g. `npm test`, fast headless verification).
  3. Spec & backlog consistency checks.
  4. Production build (e.g. `npm run build`).
  > [!CAUTION]
  > **Anti-Browser-Subagent Inefficiency:** Prohibited to invoke `browser_subagent` for logic, state, API contracts, or persistence that can be audited headlessly in milliseconds. Reserved strictly for static-undeducible visual CSS/layout issues or explicit user requests.
- **Controlled Inputs:** Every form input must have a defined initial value (e.g. `""`, never `undefined`) to avoid uncontrolled-to-controlled warnings.
- **Security First:** Always validate and sanitize inputs at application boundaries. Enforce strict authorization and never expose private keys or secrets.
- **Mobile First & Ergonomics:**
  - Minimum interactive tap target of **44×44px**.
  - Visible focus rings for keyboard navigation.
  - No horizontal page overflow on small screens (375px/390px).

---

## Git Discipline — Commits & Pushes

> [!CAUTION]
> **The canonical git policy lives in [.agents/rules/git-workflow.md](.agents/rules/git-workflow.md).** It is not duplicated here on purpose: two copies of a rule drift apart. Read it before any `git commit` or `git push`.

Headline rule, for immediate effect:

- **NEVER** execute a git commit or push without explicit verbal authorization from the user for **each** action. Words like *"looks good"*, *"ok"*, *"proceed"* mean **implement code only**.
