---
id: PLAY-005
title: "Punto de extensión del auditor: API pública, onlyFile y catálogo local por proyecto"
status: doing
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "engine"
  - "adoption"
  - "packaging"
  - "upstream"
dependencies:
  - PLAY-003
priority: high
type: feature
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
El consumidor `gripm` bifurca `scripts/audit-ux-code.cjs` y su divergencia pasó de 302 a 779 líneas. La causa no es una decisión de `gripm`: **es que no hay forma de extender el auditor sin reescribirlo.**

Tres huecos concretos, en orden de gravedad:

**1. No hay API pública.** El archivo termina en `main()` y no exporta nada. Un consumidor no puede importar el motor para componer sus propias reglas: no hay nada que importar. Bifurcar es la única salida, y por eso el `.agents/skills/` del consumidor documenta un comportamiento que el motor que corre no tiene.

**2. No hay filtro positivo de archivo.** El catálogo expone `unlessFile` (exclusión) pero ninguna forma de decir "esta regla solo aplica a archivos cuyo nombre contenga X". Sin eso, una regla acotada por contexto —"`truncate` dentro de un diálogo"— no es declarable, porque solo se puede desactivar por archivo, nunca activar.

**3. No hay catálogo local.** El catálogo canónico vive en `scripts/ux-rules.json`, que el sync reemplaza. Un consumidor que necesite una regla propia tiene que escribirla en código, dentro del motor.

Esto también products el problema de nombres que el consumidor ya sufrió: 5 de sus 8 códigos `UX-*` locales significaban otra cosa que los canónicos, porque nada reserva el prefijo `UX-` para el catálogo compartido.
<!-- SECTION:DESCRIPTION:END -->

## Out of scope

- `ENV-002` como `UX-014`. La discusión de diseño sigue abierta y no pertenece a este ítem.
- Cambios de comportamiento en las 13 firmas existentes.
- Un motor de reglas programable. El catálogo declarativo sigue siendo el contrato.

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 `audit-ux-code.cjs` exporta una API programática y el CLI sigue identico
- [x] #2 Correr el archivo como bin no dispara la auditoría, solo importarlo
- [x] #3 `onlyFile` en el catálogo: la regla solo corre si el path contiene alguno de los tokens
- [x] #4 `onlyFile` documentado en `authoring.checkSemantics`
- [x] #5 `.uxaudit.json` acepta `rules`: path a un catálogo propio del proyecto
- [x] #6 El catálogo local se mergea con el canónico, sin pisar firmas existentes
- [x] #7 Un ID local con el patrón `UX-NNN` es error fatal con mensaje explicito
- [x] #8 Un ID duplicado entre local y canónico es error fatal
- [x] #9 `--list-rules` distingue las firmas locales de las canónicas
- [x] #10 Un consumidor puede importar `auditProject` y obtener findings sin pasar por el CLI
- [x] #11 Tests que cubran API, `onlyFile` y catálogo local
- [x] #12 Documentado en README y en el skill
- [x] #13 `npm run check:all` en verde
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Guardar el CLI con `require.main === module` y exportar `{ auditProject, loadRules, loadConfig, parseArgs, buildUnits, fingerprint }`.
2. `onlyFile` en `ruleAppliesToProject`, como spec por defecto.
3. Cargar el catálogo local desde `config.rules`, validar IDs y colisiones, y concatenar al catálogo canónico marcando el origen.
4. Tests con un catálogo local temporal que contenga una regla `onlyFile`.
5. Documentar el contrato en el skill y el README, incluido el rechazo de `UX-NNN` local.
<!-- SECTION:PLAN:END -->

## Acceptance Criteria Status

**Implementado.** `npm run check:all` en verde, **46/46** (40 previos + 6 nuevos en
`describe('programmatic API (PLAY-005)')`).

Pendiente: certificación QA (T2) y publicación (T4).

### Dos defectos que aparecieron al implementarlo

**`useBaseline: false` reportaba cero.** `diffAgainstBaseline` devuelve las
observaciones que el snapshot **no** cubre, que son las que hay que reportar. Al
desactivar el baseline devolvía un Set vacío, y filtrar por ese Set se comía todos
los hallazgos. El nombre local `accepted` era engañoso y quedó como `unreviewed`.
Lo detectó el test nuevo, no una revisión manual.

**`--list-rules` leía el catálogo antes que la config**, así que un catálogo local
no aparecía en el listado. La config se lee primero ahora.

## Note on the ID namespace

## Note on the ID namespace

Reservar `UX-NNN` para el catálogo canónico no es cosmético: es lo que evita que un consumidor lea "mi UX-009 es touch target" mientras el skill dice otra cosa. Un proyecto que necesita una firma propia elige su propio prefijo — `ENV-`, `APP-`, el que corresponda — y el motor lo acepta; lo que no puede es squatsar un ID canónico.