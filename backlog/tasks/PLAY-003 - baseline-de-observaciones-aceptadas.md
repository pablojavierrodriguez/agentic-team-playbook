---
id: PLAY-003
title: "Baseline de observaciones aceptadas como capacidad genérica del auditor"
status: done
created_date: '2026-10-06'
updated_date: '2026-10-06'
labels:
  - "ux-audit"
  - "adoption"
  - "ci"
  - "upstream"
dependencies:
  - PLAY-002
priority: high
type: feature
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
El motor reportaba una ocurrencia por regla por archivo. Ese `break` era un parche para el ruido, y como parche era falso: ocultaba el 90% de las observaciones reales, y a la vez enmascaraba los falsos positivos porque cortaba el recorrido.

Adoptar el auditor sobre un codebase que ya tiene cientos de hallazgos abre un problema real: o el gate es inútil desde el primer día, o es ilegible y nadie lo lee. La respuesta estándar en la industria es un snapshot de lo ya revisado.

`gripm` ya implementó esto localmente (DEV-166) y por eso tuvo que **forkear el motor**: su `scripts/sync-playbook.mjs` preserva `audit-ux-code.cjs` para proteger el baselining frente al sync de upstream. Es decir, un consumidor-Parcheó el archivo que debería consumir, y el skill documentado empezó a describir un comportamiento que el motor que corre no tenía.

El baseline es genérico: cualquier proyecto con ruido cosmático acumulado lo necesita. Va en el playbook, no en el consumidor.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 `audit-ux-baseline.json` en el proyecto del consumidor, con `version` y `description`
- [x] #2 `--update-baseline` reescribe el snapshot y sale
- [x] #3 Sin baseline no se absorbe nada: comportamiento idéntico al previo
- [x] #4 `ERROR` nunca se absorbe, ni siquiera presente en el snapshot
- [x] #5 La fingerprint excluye el número de línea, para que importar arriba no invalide el snapshot
- [x] #6 Las ocurrencias se cuentan con multiplicidad: una quinta instancia de algo ya aceptado cuatro veces se reporta
- [x] #7 Un baseline de otra versión se descarta con warning y regenerable
- [x] #8 Reporta cuántas observaciones absorbió, en human y en JSON
- [x] #9 `audit-ux-baseline.json` en `preserved` del manifest: es del proyecto, no del framework
- [x] #10 Tests del ciclo completo
- [x] #11 `npm run check:all` en verde
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. `fingerprint(finding)`: regla + archivo + digest sha256 del snippet normalizado.
2. `loadBaseline` / `writeBaseline` contra `<ROOT>/audit-ux-baseline.json`.
3. `diffAgainstBaseline`: descuenta por multiplicidad, y todo ERROR cae al bucket de regresión.
4. `--update-baseline` escribe y sale; el run normal reporta solo lo no absorbido.
5. `npm run audit:ux:baseline` como alias.
<!-- SECTION:PLAN:END -->

## Acceptance Criteria Status

**Certificado (T2) el 2026-10-06.** `npm run validate` consistente · `npm test` **40/40** ·
ciclo de baseline verificado end-to-end sobre un proyecto de prueba: sin baseline
absorbe nada, `--update-baseline` escribe y sale, el run posterior absorbe lo
revisado, `ERROR` sobrevive al snapshot y falla el gate, y una ocurrencia nueva de
una firma ya aceptada se reporta.

**Salvedad de proceso:** ver la nota de `PLAY-001`.

- **Desbloquea el cierre del fork de `gripm`.** Con esto, `gripm` puede dejar de preservar `audit-ux-code.cjs` y consumir el motor del playbook.
## Deployed

**PLAY-003** · `@gripm/playbook@v2.1.0` en el registro publico, tag `v2.1.0` en GitHub con su release.
