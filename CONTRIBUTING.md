# Contributing

Thanks for taking the time to improve the Agentic Team Playbook.

## The rule that matters most

**This repository is held to its own Verification Pyramid.** Before opening a PR:

```bash
npm run check:all
```

That runs `npm run validate` and `npm test`. Both must pass.

## Architecture you need to know

The repo has two layers, and mixing them is the most common mistake:

| Layer | Location | Constraint |
| :--- | :--- | :--- |
| **Core** | `.agents/skills/`, `.agents/*.md`, `.agents/rules/` | Stack and product agnostic. No `YourApp`, no `admin-portal`, no prescribed backend. Enforced by `validate-repo`. |
| **Stack packs** | `.agents/stacks/<tech>/` | Vertical recipes for one technology. Installed on demand. |

If your change would make the core depend on a framework, it belongs in a stack pack instead.

## Where things live

| You want to… | Edit |
| :--- | :--- |
| Add or change a UX signature | `scripts/ux-rules.json` **and** `.agents/skills/code-level-ux-auditor/SKILL.md` |
| Add a canonical file | `.playbook-manifest.json` |
| Change a status or transition | `.agents/STATE_MACHINE.md` only — never redefine statuses elsewhere |
| Change git governance | `.agents/rules/git-workflow.md` only — `AGENTS.md` links to it |
| Add a core skill | `.agents/skills/<name>/SKILL.md` |
| Add a vertical skill | `.agents/stacks/<tech>/skills/<name>/SKILL.md` |

## Invariants `validate-repo` enforces

1. Every file in the manifest exists on disk.
2. Every `UX-0NN` exists in the catalog **and** is documented in the skill with the same title and severity, and vice versa.
3. `UX-001`…`UX-008` keep their historical IDs. Never renumber. Append from `UX-009`.
4. The core contains no product or backend references.
5. Every relative Markdown link resolves.
6. Every `SKILL.md` has frontmatter whose `name` matches its folder.
7. Status vocabulary matches `STATE_MACHINE.md`, and the backlog is not modelled as a status.

## Adding a UX signature

1. Append the rule to `scripts/ux-rules.json` with `id`, `title`, `severity`, `signature`, `impact`, `fix`, `message` and a `check`.
2. Use `requires.deps` if the rule only makes sense when a library is present. Stack-agnostic rules omit it.
3. Document it in `.agents/skills/code-level-ux-auditor/SKILL.md` as `### N. [UX-0NN] · SEVERITY · Title`, with the title copied verbatim from the catalog.
4. Add a positive and a negative fixture under `tests/fixtures/`.
5. Add the id to the "every catalogued rule fires" coverage — the test fails if a catalogued rule has no fixture.

## Commits

Do not commit on your behalf rules. The canonical git policy lives in `.agents/rules/git-workflow.md`: explicit verbal authorization is required for every commit and push.

Use Conventional Commits with a structured body when a change spans modules.

## Adding a stack pack

1. Create `.agents/stacks/<tech>/STACK.md` describing what it covers and what it assumes.
2. Put skills in `.agents/stacks/<tech>/skills/<name>/SKILL.md`.
3. Register the pack in `.playbook-manifest.json` under `stacks`.
4. Mirror the list in `FALLBACK_STACKS` in `scripts/sync-playbook.mjs`, which is used when the remote manifest cannot be fetched.
5. Document it in the README layer table.

## Reporting a bug

Include the install method, the target stack, the Node version, and the command that reproduces it. If the issue is an inconsistency inside the framework, run `npm run validate` first — it may already be reporting it.

## License

By contributing you agree that your contributions are licensed under the MIT License.