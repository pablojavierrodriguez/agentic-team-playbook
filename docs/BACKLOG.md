# Backlog

> **Vocabulary de estados:** ver [`.agents/STATE_MACHINE.md`](../.agents/STATE_MACHINE.md).
> **Status válidos:** *(sin asignar)* | `doing` | `review` | `ready` | `done`
> **El backlog no es un status.** Un ítem sin status es un ítem que aún no entró al flujo. Para poder recibir `doing` tiene que haber pasado el **refinement gate (R1)**.
> **Regla de transiciones:** solo los actores definidos en el state machine mueven un ítem. El Principal Engineer mueve `(pool) → doing → review`; el QA Auditor es el único que mueve `review → ready`; Release Management es el único que mueve `ready → done` tras un deploy real.

---

## Ítems

| ID | Título | Refined | Status | Prioridad | Sprint | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| — | _Sin ítems todavía._ | — | *(sin asignar)* | — | — | — |

---

## Definiciones

- **ID:** identificador estable y monotónico. Aparece en el `CHANGELOG` de cada release. Nunca se reutiliza.
- **Refined:** flag `yes (fecha)` / `no — falta: <qué>`. Es el **gate R1**, no un status.
- **Status:** *(sin asignar)* mientras el ítem no entró al flujo. Después: `doing`, `review`, `ready` o `done`.
- **Prioridad:** `P0` (bloquea producción) · `P1` (valor alto) · `P2` (mejora) · `P3` (deuda técnica).

---

## Reglas de higiene

1. Un ítem no recibe status `doing` sin haber pasado el refinement gate.
2. Un ítem no pasa a `review` con ACs sin marcar.
3. Ningún ítem se marca `done` sin deploy real.
4. Un ítem `ready` que recibe un fix post-QA vuelve a `doing` y pierde la certificación.
5. Los ítems no completados en el timebox del sprint vuelven al pool, conservando su refinamiento.
6. Todo tech debt detectado en QA o retrospectiva genera un ítem nuevo, sin status.

---

## Plantilla de ítem

```markdown
### [BACKLOG-001] Título corto en imperativo

- **Refined:** no — falta: ACs medibles
- **Status:** *(sin asignar)*
- **Prioridad:** P1
- **Problem:** [Qué está roto o falta, desde la perspectiva del usuario]
- **Scope:** [Qué entra explícitamente]
- **Out of scope:** [Qué NO entra, para evitar scope creep]
- **Acceptance Criteria:**
  - [ ] AC medible 1
  - [ ] AC medible 2
- **Verification:** [test headless / check manual / medición]
```