---
id: PLAY-011
title: "Sync local zero-network, smart orphan detection y State Machine canónica"
status: done
created_date: '2026-10-09'
updated_date: '2026-10-09'
labels:
  - "sync"
  - "tooling"
  - "state-machine"
  - "release"
dependencies: []
priority: high
type: feature
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mejorar el sincronizador `sync-playbook.mjs` y consolidar la taxonomía de la State Machine para permitir que cualquier proyecto consumidor (incluyendo repositorios hermanos en desarrollo local) sincronice sin fricción y sin falsos positivos:

1. **Soporte de origen local:** Permitir `--source <dir>` / `--from <dir>` o auto-detectar rutas de directorio locales en `--remote`, habilitando sincronización zero-network.
2. **Smart Orphan Detection:** `findOrphanedFiles` ahora discrimina archivos gestionados previamente mediante `.playbook-lock.json`. Reglas y skills de dominio del proyecto consumidor ya no son falsamente clasificadas como huérfanas.
3. **Consolidación de State Machine y Git Governance:** Formalización de la secuencia `draft ➔ doing ➔ review ➔ ready ➔ done` y cadencia de 1 tarea = 1 commit atómico en `STATE_MACHINE.md` y `git-workflow.md`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Soporte de `--source <dir>` / `--from <dir>` en `sync-playbook.mjs` para sincronización local
- [x] #2 Detección inteligente de huérfanos (`findOrphanedFiles`) que respeta skills/reglas propias del consumidor vía `.playbook-lock.json`
- [x] #3 Alineación de `STATE_MACHINE.md` y `git-workflow.md` con taxonomía unificada
- [x] #4 Suite de pruebas automatizadas con 49 tests en verde (`npm test`) y validación de manifiesto (`npm run validate`)
- [x] #5 Manifiesto, package.json y CHANGELOG actualizados a v2.2.2
<!-- AC:END -->

## Implementation Notes

Implementado y validado en la suite de pruebas unitarias (`tests/sync.test.mjs`), cubriendo tanto la detección inteligente de huérfanos con lockfile como la sincronización local sin red.
