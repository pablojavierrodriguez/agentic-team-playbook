# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [2.1.0] — 2026-10-06

`PLAY-001` · `PLAY-002` · `PLAY-003` · `PLAY-004` · `DEV-184` · `DEV-187`

### Added

- **The auditor now understands JSX nesting** (`PLAY-001`). This is the root cause behind two long-standing false-positive sources. `buildUnits` counted `<` openings against `>` closings as characters, so a self-closing `<Icon />` ended its parent's unit and `<button>` was separated from its own contents. A rule asking "what does this element contain" got an empty string, and the only way to answer it was to search the entire file — which made one `const Icon = () => null` turn every button in the file into an icon-only button. Units now track real nesting depth and expose three granularities:
  - `text` — the opening tag and its attributes. Signatures match here, so a finding points at the element that carries the problem instead of its wrapper.
  - `ownContent` — the element's own content, excluding descendants. This is how a rule asks "is *this* element the one rendering the value?".
  - `scopeText` — the element plus every descendant. This is how a rule asks "does this element contain that?".
- **`exclude` is implemented in the UX auditor** (`DEV-184`). The property was documented in the README but silently ignored by the runner. It resolves through a dependency-free glob supporting `**`, `*` and `?`. Each pattern matches both literally and at any depth, so `src/legacy/**` and `**/src/legacy/**` are equivalent. Excluded files are dropped before auditing.
- **Accepted-observation baseline** (`PLAY-003`). `audit-ux-baseline.json` records the observations a project has already reviewed, so the auditor can be adopted on a codebase that already carries hundreds of findings without either silencing the gate or producing a report nobody reads. `--update-baseline` rewrites the snapshot. **`ERROR` is never absorbed** — a severity that breaks the build cannot be switched off by a file. Occurrences are counted with multiplicity, so a fifth instance of something already accepted four times is reported.
- **`unlessVisibleText`** (`PLAY-002`). A new engine capability that asks whether an element renders visible text. No token list can express it: `<button><span>Guardar</span></button>` is accessible without a single `aria-*` attribute. The text is derived from parse offsets rather than stripped from the raw source, because `/<[^>]*>/g` cannot tell a tag terminator from the `>` of an arrow function and would leave `go()}` behind on `<button onClick={() => go()}>` — making an icon-only button look like it had a label.

### Fixed

- **One occurrence per file is gone** (`PLAY-002`). The engine carried `break; // one finding per rule per file keeps the report actionable`, which capped the report at one observation per rule per file. A consumer measured 49 reported findings against 487 actual — 90% of the signal hidden. It was also the reason the false positives went unnoticed: with the `break` in place, the minimal reproduction reported one false positive instead of two, because the scan stopped before the second case. The baseline replaces it as the noise-management mechanism.
- **`UX-010` no longer reports buttons that show a visible label** (`PLAY-002`). Its escapes were all attribute-based (`aria-label`, `title=`, `aria-labelledby`, `sr-only`), so a button whose child is visible text was still reported.
- **Parser robustness** (`PLAY-001`). Fragments (`<>`), unbalanced markup, self-closing roots, comparisons and generics inside attributes, and arrow functions in event handlers are all handled without crashing, hanging, or mis-attributing a signature. An unclosed element is closed at the nearest closing tag instead of swallowing the rest of the file.
- **`UX-006` rewritten from `needsContent` to `nearby`** (`PLAY-001`). The rule pairs a padded scroll container with a fixed bottom bar, which are two different elements; it only ever worked because `needsContent` was file-scoped.
- **`UX-004` and `UX-013` now declare `alsoContent`** (`PLAY-001`), so a finding points at the element rendering the value rather than at its wrapper.
- **Multi-line JSX was split at the wrong boundary** (`DEV-184`). `buildUnits` counted every `>` as a tag terminator, including the one in an arrow function (`=>`), which closed the logical unit early and pushed the escape hatch into the next unit where the rule could not see it.
- **Transition references pointed at transitions that do not exist** (`DEV-184`). `SPRINT_SPEC_TEMPLATE.md` and `TEAM_PLAYBOOK.md` referenced a `T6` and mislabelled `T1`–`T4`. Both are aligned with `STATE_MACHINE.md`, which is the source of truth.
- **This changelog had duplicate sections.** `[2.0.1]` declared `### Fixed` twice with the same bullet in both, and `[2.0.0]` appeared as two separate headings. Both are merged, and the `[Unreleased]` link no longer compares from `v2.0.0`.

### Changed

- **The backlog is a Backlog.md item pool, and GitHub Issues is only the intake channel** (`PLAY-001`..`PLAY-004`). `README.md` already instructed the PM Orchestrator to read backlog issues through GitHub MCP and `STATE_MACHINE.md` requires each release to cite backlog IDs, but no item pool existed — so unregistered work accumulated in this changelog instead. Items now live in `backlog/tasks/` in the same Backlog.md format `gripm` and `dev-board` use, with the `PLAY-` prefix. **The changelog records releases, never open work.**

### Removed

- **The `agentic-team-playbook` bin** (`PLAY-004`), a leftover from the rename that `DEV-179` performed everywhere else. **Breaking.** Anyone invoking the old binary name must switch to `npx @gripm/playbook sync` or the `playbook` / `gripm-playbook` binaries.

---

## [2.0.1] — 2026-10-05

### Added

- **Canonicity detection.** When there is no lockfile baseline, the sync now asks the upstream commit history whether a local file matches any published revision of that path. A file that turns out to be an older canonical revision is moved forward instead of being reported as a conflict, so the first sync after a hand install no longer flags every untouched file. Requests are bounded per run and both failure modes fail safe: an unreachable history protects the file rather than overwriting it.
- **`--adopt`** keeps every differing file, records it as the baseline, and touches nothing. `--no-history` skips the provenance lookup.
- **Orphan detection.** Framework files present under `.agents/` that are no longer part of the install plan — the usual symptom of a version that moved them — are reported. Nothing is deleted.
- **Tests for the sync layer**: the canonicity decision table, the provenance resolver against a stubbed GitHub, and orphan detection.

### Fixed

- **Saneamiento P0 de skills de stacks**: Eliminadas todas las referencias residuales a componentes y entidades de prueba (`People.tsx`, `SettingsPage.tsx`, `MeetingDetailModal`, `PermissionGate`, `SPEC-070`, `vibrant-gradient-primary`, `font-mono-data`, `Check-in QR`, `OrgContext`) en los skills de `react` y `mobile`.
- **Formato regional estándar**: Reemplazado el valor inválido `'regional-locale'` por formato regional BCP-47 (`es-ES`) en `recharts-reporting` y `forms-rhf-zod`.
- **A local customisation was protected exactly once.** The lockfile recorded the local hash of a protected file, so on the next run the file matched its own baseline and was overwritten without warning. Customizations are now recorded in a dedicated `customizations` list and stay protected until `--force`.

## [2.0.0] — 2026-10-04

### Added

- **`.agents/STATE_MACHINE.md`** — single source of truth for delivery statuses and transitions, with actors and guards.
  - Exactly four statuses: `doing`, `review`, `ready`, `done`.
  - The backlog is modelled as the *absence* of a status, not as one.
  - Refinement is documented as **gate R1**, an entry condition, not a state.
- **`docs/BACKLOG.md`** — item pool with a `Refined` flag and an item template.
- **`scripts/ux-rules.json`** — declarative rule catalog. Detection knowledge now lives in one place instead of inside the runner.
- **`scripts/validate-repo.mjs`** — consistency guardian: manifest ⇄ disk, rule catalog ⇄ skill documentation, core purity, relative links, skill frontmatter, status vocabulary.
- **`tests/`** — 13 tests over the rule engine, with positive and negative fixtures.
- **Stack packs** — optional `.agents/stacks/{react,mobile,pwa}`, installed on demand with `--stack <name>`.
- **`.playbook-manifest.json`** — declarative install manifest, so adding a file no longer requires a script change.
- **CI workflow** — runs `validate` + `test` on Node 20 and 22.
- **Issue and PR templates.**
- **`--list-rules`, `--format json`, `--rule <id>`, `--src`, `--config` and `--quiet` flags** for the UX auditor.

### Changed

- **`audit-ux-code.cjs` is now a generic engine.** Removed every hardcoded project reference (`YourApp`, `TransactionList.tsx`, `AccountManager.tsx`, `formatAmount`, `ReportsPage.tsx`, `Landing.tsx`).
- **Stack awareness by dependency.** Rules that need `date-fns` or `framer-motion` declare `requires.deps` and skip themselves when the library is absent.
- **`sync-playbook.mjs` is non-destructive.** Local modifications are detected through `.playbook-lock.json` and reported as `[Protected]` instead of being silently overwritten.
- **Sync pins a git ref** (latest release tag) instead of tracking a moving branch.
- **Sync retries with backoff and timeout**, and backs up overwritten files under `.playbook-backups/`.
- **Sprint spec template** rewritten to the canonical vocabulary, with an acceptance-criteria table, the refinement gate, and the previously missing **Release Management** section.
- **Core skills neutralised.** Removed all references to a specific product, backend and financial domain from `pm-orchestrator`, `principal-engineer`, `rigorous-qa-auditor`, `market-researcher` and `worldclass-product-designer`.

### Fixed

- The README claimed the sync preserved local files; it now states exactly what is preserved.
- `audit-ux-code.cjs` crashed with `ENOENT: scandir '.../src'` on any project without a JavaScript source directory. It now reports and exits 0.
- The auditor excluded `src/components/ui/`, which silenced most findings in shadcn/Radix projects.
- The `errors.length > 0` exit branch was unreachable: no rule ever emitted `ERROR`. `UX-001` and `UX-005` now do.
- **Signature drift.** `UX-006`, `UX-007` and `UX-008` meant different things in the skill documentation than in the script. The catalog is now canonical, IDs are frozen, and `validate-repo` fails on drift.
- `UX-006` (fixed bottom UI occlusion) and `UX-008` (micro-Jank) were documented but **had no implementation at all**. Both are now detected.
- **Multi-line JSX produced false positives.** An escape hatch such as `inputMode="decimal"` on the line below `type="number"` was invisible to line-based matching. The engine now groups lines into logical JSX units.
- The template's QA section demanded browser sub-agents, directly contradicting the anti-browser rule in `AGENTS.md`.
- Broken relative link `file:///.agents/TEAM_PLAYBOOK.md` in `AGENTS.md`.
- A dangling link to `SPEC-076-dashboard-improvements.md` in the `recharts-reporting` skill.
- `npm run check:all` was mandated by `pm-orchestrator` but did not exist.

### Removed

- Duplicated git policy between `AGENTS.md` and `.agents/rules/git-workflow.md`. `AGENTS.md` now links to the rule file; the duplicate is gone.
- The README claimed the sync preserved local files; it only ever preserved `AGENTS.md`.

### Packaging

- Configured for npm publication under `@gripm/playbook` supporting `npx @gripm/playbook sync`.

[Unreleased]: https://github.com/pablojavierrodriguez/gripm-playbook/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/pablojavierrodriguez/gripm-playbook/releases/tag/v2.1.0
[2.0.1]: https://github.com/pablojavierrodriguez/gripm-playbook/releases/tag/v2.0.1
[2.0.0]: https://github.com/pablojavierrodriguez/gripm-playbook/releases/tag/v2.0.0