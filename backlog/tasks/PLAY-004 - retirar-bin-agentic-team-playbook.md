---
id: PLAY-004
title: "Retirar el bin agentic-team-playbook, residuo del renombre a gripm-playbook"
status: ready
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "branding"
  - "packaging"
  - "breaking"
dependencies: []
priority: medium
type: chore
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`DEV-179` renombró el proyecto a `gripm-playbook` y limpió README, `sync-playbook.mjs` y los badges. Se le olvidó `package.json`: el bin `agentic-team-playbook` siguió apuntando al sync, de modo que el nombre viejo seguía siendo invocable después de haber sido declarado muerto.

Es un residuo de bajo impacto pero con costo de mantenimiento real: mientras exista, un documento, un script o una persona que busque el proyecto viejo lo encuentra y no tiene forma de saber que está obsoleto.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El bin `agentic-team-playbook` se elimina de `package.json`
- [x] #2 Los bins canónicos `playbook` y `gripm-playbook` se conservan
- [x] #3 Una búsqueda del nombre viejo devuelve cero resultados
- [x] #4 La ruptura queda explícita en el CHANGELOG de la versión
- [x] #5 `npm run check:all` en verde
<!-- AC:END -->

## Out of scope

- Renombrar el directorio local. Es cosmético y rompe la ruta absoluta que `gripm` tiene registrada en `projects-registry.json`.

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Quitar la entrada del bin en `package.json`.
2. Declarar el cambio como rompiente en el CHANGELOG con la ruta de migración.
3. `npx @gripm/playbook sync` sigue siendo la forma soportada.
<!-- SECTION:PLAN:END -->

## Acceptance Criteria Status

**Certificado (T2) el 2026-10-06.** `npm run validate` consistente · `npm test` **40/40** ·
`grep` del nombre viejo devuelve solo las apariciones en este ítem, que lo documentan.

**Salvedad de proceso:** ver la nota de `PLAY-001`.

- Pendiente: publicación (T4).