---
id: PLAY-006
title: "UX-010: el texto visible de un descendiente cuenta, y los custom controls entran en la firma"
status: ready
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "ux-audit"
  - "a11y"
  - "upstream"
  - "correctness"
dependencies:
  - PLAY-002
priority: high
type: bugfix
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dos defectos residuales de `UX-010` reportados por el consumidor contra el tarball de `2.1.0` (`DEV-188`). Verificados y reproducidos acá antes de tocar nada.

**1. `unlessVisibleText` era inerte para la forma más común de botón.** Contaba solo los nodos de texto directos del elemento y excluía los descendientes, así que:

```jsx
<button onClick={save}><Icon /><span>Guardar</span></button>
```

se reportaba como botón icon-only sin nombre. Un control que le muestra "Guardar" a la persona **no** es un control sin nombre, y ese markup es exactamente cómo se escriben los botones con icono y etiqueta.

**2. Un control custom nunca estuvo cubierto.** La firma era `<button`, `<Button`, `motion.button`. Un `div[role=button]` con solo un icono pasaba limpio. Los ARIA buttons son un patrón documentado y la regla los era ciega.

**Por qué importaba:** hacen que el "0 hallazgos" de `UX-010` sea un techo, no una prueba. El consumidor ya tiene el caso concreto: puso `role="button"` en la raíz de `ItemCard` en su AC #6, hoy con `aria-label`, pero si mañana alguien lo saca el gate no avisa.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El texto renderizado por descendientes cuenta para `unlessVisibleText`
- [x] #2 Un botón multilínea con icono y etiqueta visible no se reporta
- [x] #3 `role="button"` entra en la firma de `UX-010`
- [x] #4 Un `div[role=button]` con solo un icono se reporta
- [x] #5 Un `div[role=button]` con etiqueta visible no se reporta
- [x] #6 `IconOnly.tsx` cubre las cinco formas etiquetadas y las dos sin nombre
- [x] #7 La aserción lista exactamente qué dos líneas pueden reportarse
- [x] #8 `npm run check:all` en verde
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. `textContent` se resuelve de abajo hacia arriba sobre el árbol de parseo: el texto propio más el de cada descendiente. Los atributos quedan excluidos por construcción y las expresiones `{...}` se descartan.
2. `role="button"` y `role='button'` agregados a `check.line` de `UX-010`.
3. Reescritura de `IconOnly.tsx` con las cinco formas etiquetadas (texto directo, etiqueta envuelta, multilínea con icono, multilínea envuelta, `div[role=button]` etiquetado) y las dos sin nombre.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Este defecto salió como parte de una capacidad **nacida rota en 2.1.0**, y lo que lo dejó pasar fue la suite, no una falta de revisión.

El fixture anterior tenía un solo caso etiquetado: `<button><span>Guardar</span></button>` en una línea. Ese caso nunca ejercitaba el defecto, porque `needsContent` lo filtraba primero por un motivo no relacionado —no había `Icon` en el botón—. La conclusión "hasVisibleText funciona" era correcta para el caso medido y falsa para el caso que importaba.

Un caso de prueba que pasa por la razón equivocada no prueba nada. El fixture ahora cubre las cinco formas, y la aserción en vez de comprobar ausencias cuenta las líneas exactas que sí pueden reportarse.
<!-- SECTION:NOTES:END -->

## Acceptance Criteria Status

**Certificado el 2026-10-06.** `npm run validate` consistente, `npm test` **46/46**.

Verificación independiente sobre el fixture: `UX-010` reporta exactamente las líneas 49 y 58, que son `<button onClick={remove}>` con solo `<Icon />` y `<div role="button">` con solo `<Icon />`. Las cinco formas etiquetadas, incluida la multilínea con icono, quedan limpias.

Pendiente: publicación (T4).