# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [2.1.0] — 2026-10-06

### Added

- **`exclude` is now implemented in the UX auditor** (#3). The property was documented in the README but silently ignored by the runner. It resolves through a dependency-free glob supporting `**`, `*` and `?`. Each pattern matches both literally and at any depth, so `src/legacy/**` and `**/src/legacy/**` are equivalent and the author never has to guess the anchor. Excluded files are dropped before auditing and never reach the report.
- **Regression test for multi-line JSX** (#3). A fixture reproduces the `UX-001` false positive and fails without the `countTagCloses` fix.

### Fixed

- **Multi-line JSX was split at the wrong boundary** (#3). `buildUnits` counted every `>` as a tag terminator, including the one in an arrow function (`=>`). That closed the logical unit early and pushed the escape hatch into the next unit, where it was no longer visible to the rule — the defect that made the `UX-001` false positive survive. `countTagCloses` now ignores `=>`.
- **Transition references pointed at transitions that do not exist** (#3). `SPRINT_SPEC_TEMPLATE.md` and `TEAM_PLAYBOOK.md` referenced a `T6`, and mislabelled `T1`–`T4`. Both are aligned with `STATE_MACHINE.md`, which is the source of truth: `T1` for `doing → review`, `T2` for `review → ready`, `T3` for `review → doing`, `T4` for `ready → done`.
- **This changelog had duplicate sections** (#4). `[2.0.1]` declared `### Fixed` twice with the same bullet in both, and `[2.0.0]` appeared as two separate headings, which split its entries across two blocks. Both sections are merged. The `[Unreleased]` link also compared from `v2.0.0`, so it under-reported every release since.

### Changed

- **The backlog is now GitHub Issues, not a file in this repository** (#5). `README.md` already instructed the PM Orchestrator to read backlog issues through GitHub MCP, and the `STATE_MACHINE` requires each release to list items by their backlog ID, but no issue tracker existed — so unregistered work accumulated in this changelog instead. `docs/BACKLOG.md` keeps the item template and the hygiene rules and now points at the tracker; it is no longer a parallel ledger. **The changelog records releases, never open work.**

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