---
name: Bug report
about: Something in the framework does not work as documented
labels: bug
---

**What happens**
<!-- The observed behaviour. -->

**What you expected**
<!-- The documented behaviour, with a link to the section that promises it. -->

**Reproduction**
```bash
# Minimal command sequence that reproduces it
```

**Context**
- Playbook version / ref: <!-- e.g. v2.0.0, or "main" -->
- Install method: <!-- Option A copy · Option B gripm · Option C global -->
- Target stack: <!-- e.g. Go, React 19 + Vite, Python/FastAPI -->
- Node version: <!-- node -v -->

**Checklist**
- [ ] I read `.agents/STATE_MACHINE.md` if the issue concerns a status
- [ ] I ran `npm run validate` in the playbook repo if the issue is an inconsistency
