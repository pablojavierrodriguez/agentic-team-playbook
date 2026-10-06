---
id: PLAY-001
title: "Anatomía de unidad en el motor de reglas: text, ownContent y scopeText"
status: review
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "ux-audit"
  - "engine"
  - "upstream"
  - "correctness"
dependencies:
  - DEV-187
priority: high
type: bugfix
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Causa raíz de los defectos DEV-187 #1 y #2. `needsContent` se evaluaba contra `content`, el **archivo entero**, así que un solo `const Icon = () => null` en cualquier línea convertía a todos los botones del archivo en botones "icon-only". En `gripm` eso producía 127 hallazgos de UX-010 en 13 archivos, de los cuales ~101 son falsos positivos.

La causa no era el `lineMatches` sino `buildUnits`. El segmentador anterior contaba `<` abiertos contra `>` cerrados como caracteres, sin distinguir un self-closing `<Icon />` de un elemento con hijos. Consecuencia: `<button>` y su contenido caían en unidades distintas, y "el contenido de este elemento" no era una pregunta computable. Aplicar `content` → `unit.text` al pie de la lettre corrige el caso de una línea y **regresiona `UX-006`**, cuyo fixture es multilínea.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 `buildUnits` distingue open, self-close y close, y rastrea profundidad de anidamiento real
- [x] #2 Un self-closing hijo no cierra a su padre: `<button><Icon /></button>` es una sola unidad
- [x] #3 Cada unidad expone `text` (tag de apertura), `ownContent` (sin descendientes) y `scopeText` (subárbol completo)
- [x] #4 `needsContent`/`unlessContent` leen `scopeText`; `line`/`alsoLine` leen `text`
- [x] #5 `UX-006` reescrita de `needsContent` a `nearby`: la regla es inherentemente cross-elemento
- [x] #6 `UX-004` y `UX-013` declaradas con `alsoContent` para que apunten al elemento que renderiza el valor, no al wrapper
- [x] #7 El hallazgo reporta la línea exacta del elemento, no la del contenedor
- [x] #8 `npm run check:all` en verde
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Escaner lineal de tags con `findTagEnd`, que salta strings, expresiones `{...}` y flechas `=>` para no cortar el tag en el `>` equivocado.
2. Árbol de frames con `spanStart`/`spanEnd` por elemento; los frames desbalanceados se cierran en el tag de cierre más cercano en vez de descartarse.
3. `ownContent` derivado del árbol: fuente del elemento menos la fuente de cada descendiente.
4. Contrato de tres granularidades documentado en el skill `code-level-ux-auditor`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Se agregaron 4 tests en `describe('unit scoping (DEV-187)')` que fijan el comportamiento por granularidad, más el fixture `Dev187Repro.tsx` con la reproducción mínima reportada por el dev de gripm.

`findTagEnd` devuelve el índice del `>` y la detección de self-closing se hace sobre el texto del tag. Una versión anterior devolvía `i + 1` y el `slice` se comía el `<` siguiente, lo que convertía `<Icon />` en un tag abierto sin cierre y hacía que el `</button>` del hermano cerrara el `<div>`.
<!-- SECTION:NOTES:END -->

## Acceptance Criteria Status

- Tests: `npm run check:all` → 37/37.
- Pendiente: certificación QA (transición T2).