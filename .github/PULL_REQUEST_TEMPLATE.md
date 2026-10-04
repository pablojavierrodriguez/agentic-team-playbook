## What this changes

## Why

## Verification

The repo enforces its own Verification Pyramid. Run and paste the output:

```bash
npm run validate
npm test
```

- [ ] `npm run validate` passes
- [ ] `npm test` passes
- [ ] New rules are documented in `.agents/skills/code-level-ux-auditor/SKILL.md` **and** in `scripts/ux-rules.json`
- [ ] New canonical files are listed in `.playbook-manifest.json`
- [ ] New skills are either in `.agents/skills/` (core, stack agnostic) or `.agents/stacks/<tech>/` (vertical)
- [ ] The core layer contains no references to a specific product or backend
- [ ] Status names match `.agents/STATE_MACHINE.md` (`doing`, `review`, `ready`, `done`)

## Docs

- [ ] README updated if behaviour, counts or commands changed
- [ ] `CHANGELOG.md` updated under *Unreleased*
