---
id: PLAY-002
title: "UX-010: nombre visible como escape, y reporte de toda ocurrencia en vez de una por archivo"
status: done
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "ux-audit"
  - "a11y"
  - "upstream"
  - "reporting"
dependencies:
  - PLAY-001
priority: high
type: bugfix
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dos defectos reportados por el dev de `gripm` en el retro `2026-10-06-auditoria-real-code-level-ux-auditor`.

**1. `UX-010` no veía etiqueta de texto visible.** Sus escapes eran todos por atributo (`aria-label`, `title=`, `aria-labelledby`, `sr-only`), así que `<button><span>visible label</span></button>` se reportaba igual. Ninguna lista de tokens puede expresar "este control ya tiene un nombre visible"; hacía falta capacidad del motor.

**2. `break` por archivo.** El motor traía `break; // one finding per rule per file keeps the report actionable`, que limitaba a una observación por regla por archivo. En `gripm` reportaba 49 hallazgos donde había 487: ocultaba el 90% del ruido y volvía inútil cualquier baseline.

El defecto 2 era además la razón por la que el defecto 1 pasaba desapercibido upstream: con el `break`, la reproducción mínima reportaba **1** falso positivo en vez de 2, porque el recorrido cortaba antes del segundo caso.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Nueva capacidad de motor `unlessVisibleText` que evalúa si el elemento renderiza texto, quitando tags y expresiones
- [x] #2 `UX-010` no reporta botón con etiqueta de texto visible como hijo
- [x] #3 `UX-010` sigue reportando un botón realmente icon-only sin nombre
- [x] #4 El `break` por archivo se elimina: se reporta cada ocurrencia
- [x] #5 El baseline reemplaza al `break` como mecanismo de gestión de ruido (ver PLAY-003)
- [x] #6 Fixture de regresión con la reproducción mínima del dev
- [x] #7 `npm run check:all` en verde
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. `hasVisibleText(scopeText)`: quitar tags con `/<[^>]*>/g`, quitar expresiones con `/\{[^}]*\}/g`, y considerar que queda texto si sobrevive algo sin espacios.
2. Declarar `unlessVisibleText: true` en `UX-010`.
3. Eliminar el `break` del bucle de hallazgos.
4. Tests que verifican las tres líneas de la reproducción mínima y el caso genuino, en una línea y en multilínea.
<!-- SECTION:PLAN:END -->

## Acceptance Criteria Status

**Certificado (T2) el 2026-10-06.** `npm run validate` consistente · `npm test` **40/40** ·
`npm pack --dry-run` limpio. Los tres escapes verificados sobre la reproducción
mínima del dev de `gripm`: `aria-label` omitido, texto plano omitido, `<span>` como
hijo omitido, y el botón realmente icon-only reportado en una línea **y** en
multilínea.

**Salvedad de proceso:** ver la nota de `PLAY-001`. La certificación la ejecutó el
mismo agente que implementó, y el invariante 2 del state machine exige que `review
→ ready` lo haga el rol de QA.

- **Impacto en `gripm`:** el baseline de `gripm` queda invalidado por este cambio. Las 127 entradas de UX-010 significan otra cosa y deben regenerarse. Bloqueante de DEV-173.
## Deployed

**PLAY-002** · `@gripm/playbook@v2.1.0` en el registro publico, tag `v2.1.0` en GitHub con su release.
