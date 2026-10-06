---
id: PLAY-008
title: "Exports map y verificación del catálogo local en validate-repo"
status: ideas
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "packaging"
  - "tooling"
  - "adoption"
dependencies:
  - PLAY-005
priority: medium
type: improvement
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dos huecos que aparecieron al publicar el punto de extensión (PLAY-005).

**1. El import del motor es un deep require.**

```js
const { auditProject } = require('@gripm/playbook/scripts/audit-ux-code.cjs');
```

Funciona porque el paquete no define un campo `exports`. En el momento en que se agregue uno —por ejemplo para restringir `main` o exponer el auditor con un nombre estable— **todos los deep requires externos se rompen**. El día que seake un `exports` map, los consumidores que hayan migrado con esta ruta reciben un error en runtime.

**2. `validate-repo` no conoce el catálogo local.** Verifica que el catálogo canónico ⇄ skill ⇄ manifiesto estén consistentes. No valida un catálogo propio del proyecto: ni sus IDs, ni sus checks, ni que no colisione con un ID canónico. El motor rechaza esas tres cosas al cargar, pero el error aparece tarde, en el momento de auditar, y no en el gate de consistencia.

Además, el error de colisión actual dice "reserved canonical pattern" incluso cuando el ID colisiona con una firma canónica concreta y no con el patrón. El mensaje correcto sería distinto en cada caso.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] `package.json` define un `exports` map con un nombre estable para el auditor
- [ ] La ruta del import documentado sigue funcionando
- [ ] `validate-repo` valida un catálogo local declarado en `.uxaudit.json`
- [ ] Un ID local que colisiona con una firma canónica da un mensaje que nombra la firma
- [ ] Un ID local con el patrón reservado da un mensaje distinto del de colisión
- [ ] `npm run check:all` en verde
<!-- AC:END -->

## Implementation Notes

El orden importa: primero el `exports` map con un alias estable y el deep require conservado como alias, y después la validación en `validate-repo`. Al revés se rompen consumidores que ya migraron.

## Acceptance Criteria Status

Sin empezar.