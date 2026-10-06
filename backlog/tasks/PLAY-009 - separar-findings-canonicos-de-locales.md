---
id: PLAY-009
title: "La puerta de salida del motor debe separar findings canónicos de locales"
status: ideas
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "baseline"
  - "observability"
  - "tooling"
dependencies:
  - PLAY-003
priority: medium
type: improvement
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`--strict` decide el código de salida sobre **todos** los hallazgos reportados. Con un catálogo local activo, un consumidor tiene tres clases de observación mezcladas en un solo contador:

- firmas canónicas del playbook
- firmas locales del proyecto
- observaciones absorbidas por el baseline

Un `--strict` que falla por una regla local no dice cuál de las dos familias es responsable, y un `--strict` en CI que falla por un invariante propio no es comparable con uno que falla por el catálogo compartido. Dos proyectos con el mismo resultado pueden tener causas distintas y ningún signal para distinguirlas.

El baseline tiene el mismo problema, que es más caro: la fingerprint es `regla|archivo|digest`. Un snapshot tomado antes de agregar una regla local contiene entradas que después se reinterpretan, y no hay forma de regenerar el snapshot **solo** para las firmas locales sin perder el trabajo de revisión de las canónicas.
<!-- SECTION:DESCRIPTION:END -->

## Out of scope

- Cambiar la semántica de `ERROR` como no absorbible.
- Reglas configurables por severidad.

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] El reporte distingue findings canónicos de locales
- [ ] `--strict` puede limitarse a las firmas canónicas
- [ ] `--update-baseline` puede regenerar solo un subconjunto de firmas
- [ ] Un snapshot parcial no pierde la revisión de las firmas que no se regeneran
- [ ] La salida JSON declara el origen de cada hallazgo
- [ ] `npm run check:all` en verde
<!-- AC:END -->

## Options considered

1. **Filtrar por origen.** `--strict --canonical-only`, y `--update-baseline --only local`. Simple, pero mezcla ejes: origen y alcance.
2. **Snapshots separados.** Un archivo por familia de firmas. Más limpio conceptualmente, pero obliga al consumidor a mantener dos y crea el problema de qué pasa si una regla local colisiona con una canónica.
3. **Snapshots por origen, con un flag para regenerar el conjunto.** Es la opción 2 con una válvula de escape.

La 1 resuelve el `--strict` barato y deja la parte del baseline para un ítem propio si resulta un problema real. El caso del snapshot invalidado por una regla nueva no se ha observado todavía en un consumidor; conviene no sobre-diseñar antes de verlo.

## Acceptance Criteria Status

Sin empezar. Prioridad relativa a que un consumidor migre de verdad.