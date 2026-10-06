---
id: PLAY-007
title: "onlyFile debería enganchar el componente renderizado y no el nombre del archivo"
status: ideas
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "engine"
  - "correctness"
  - "authoring"
dependencies:
  - PLAY-005
priority: medium
type: improvement
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`onlyFile` (PLAY-005) resuelve por **nombre de archivo**. Es lo que el consumidor necesitaba para expresar "`truncate` dentro de un diálogo", y funciona, pero la forma en que funciona es frágil:

```json
"check": { "line": ["truncate"], "onlyFile": ["Modal", "Dialog"] }
```

Un diálogo definido en `Overlays.tsx` no se ve. Uno en `ConfirmModal.tsx`, sí. El comportamiento depende de cómo el proyecto nombró sus archivos, no de qué renderiza el componente.

La misma debilidad ya existía en el invariante `ENV-002` del consumidor, y fue parte de lo que abrió la pregunta de si debía promoverse al catálogo: el problema no es solo si una regla debe ser canónica, sino si la regla es correcta.
<!-- SECTION:DESCRIPTION:END -->

## Out of scope

- Cambios de comportamiento en las 13 firmas canónicas.
- Un motor de reglas programable. El catálogo declarativo sigue siendo el contrato.

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] Un check kind filtra por el componente renderizado y no por el nombre del archivo
- [ ] Un `<Dialog>` declarado en un archivo con cualquier nombre queda cubierto
- [ ] `onlyFile` por nombre de archivo se mantiene o se deprecia de forma explícita
- [ ] La documentación de `authoring.checkSemantics` distingue ambos
- [ ] Un fixture con un diálogo en un archivo de nombre no obvio
- [ ] `npm run check:all` en verde
<!-- AC:END -->

## Options considered

1. **Mantener solo `onlyFile` y documentar la limitación.** Barato, y la mayoría de los proyectos ya nombran por responsabilidad (`ConfirmDialog.tsx`).
2. **Agregar `withinComponent`.** Un check kind que filtra por el componente padre en el árbol de parseo, que ya existe. Cubre el caso real sin cambiar el modelo.
3. **Nombre de archivo como default, componente como override.** Más expresivo, más superficie.

La 2 es la que conviene: el árbol de parseo ya sabe quién contiene a quién, y "¿esto está dentro de un `<Dialog>`?" es una pregunta que puede responder sin heurísticas de naming.

## Acceptance Criteria Status

Sin empezar. Discusión abierta: qué opción, y si `onlyFile` conserva el nombre o se renombra.