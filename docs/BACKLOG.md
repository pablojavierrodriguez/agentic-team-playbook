# Backlog

> **Este archivo no es el backlog.** Es la convención que lo governa.
> El backlog real vive en **[GitHub Issues](https://github.com/pablojavierrodriguez/gripm-playbook/issues)**.
>
> **Vocabulary de estados:** ver [`.agents/STATE_MACHINE.md`](../.agents/STATE_MACHINE.md).
> **Status válidos:** *(sin asignar)* | `doing` | `review` | `ready` | `done`

---

## 1. Dónde vive cada cosa

| Artefacto | Ubicación | Contiene |
| :--- | :--- | :--- |
| **Backlog** | GitHub Issues | Todo ítem abierto. Incluye los refinados y los no refinados. |
| **Release log** | `CHANGELOG.md` | Solo lo que ya se publicó. **Nunca** trabajo abierto. |
| **Sprint** | `docs/sprints/SPRINT-XXX.md` | Los ítems comprometidos en un timebox, con su ACs. |

> [!CAUTION]
> **El changelog no es una bitácora.** Registrar un ítem todavía abierto en `## [Unreleased]` no lo registra: lo esconde. Si el trabajo todavía no está publicado, su lugar es un issue. `Unreleased` queda vacío por diseño y solo se llena al publicar.

Por qué issues y no un markdown en el repo: el `README` ya le indica al PM Orchestrator leer los ítems del backlog vía GitHub MCP, y el release se arma por valor entregado desde ítems `ready` que pueden ser históricos o del sprint en curso. Un archivo no da historial, ni búsqueda, ni discussion. Un archivo solo funcionaba mientras alguien lo actualizara a mano, que es justo lo que dejó de pasar.

---

## 2. Ciclo de vida de un ítem

Un issue **nace** como ítem del backlog. El status se escribe en el issue (campo o etiqueta) y **nunca** en el changelog.

| Momento | Dónde se registra | Quién |
| :--- | :--- | :--- |
| Aparece un problema | Issue nuevo, sin status | cualquiera |
| Pasa el **gate R1** (refinement) | Comentario con ACs medibles | PM Orchestrator |
| `doing` | Etiqueta / campo `Status` | Principal Engineer |
| `review` | Etiqueta / campo `Status` | Principal Engineer |
| `ready` | Etiqueta / campo `Status` | **Solo QA Auditor** (T2) |
| `done` | Etiqueta / campo `Status` + issue cerrado | Release Management, tras deploy real |
| Entra en un release | `CHANGELOG.md`, bajo el ID `#<issue>` | Release Management |

**El backlog no es un status.** Un ítem sin status es un ítem que aún no entró al flujo. Para recibir `doing` tiene que haber pasado el refinement gate.

---

## 3. Definiciones

- **ID:** el número del issue de GitHub (`#184`). Es estable, monotónico y nunca se reutiliza. Es lo que aparece en el `CHANGELOG` de cada release.
- **Refined:** flag `yes (fecha)` / `no — falta: <qué>`. Es el **gate R1**, no un status.
- **Status:** *(sin asignar)* mientras el ítem no entró al flujo. Después: `doing`, `review`, `ready` o `done`.
- **Prioridad:** `P0` (bloquea producción) · `P1` (valor alto) · `P2` (mejora) · `P3` (deuda técnica).

---

## 4. Reglas de higiene

1. Un ítem no recibe status `doing` sin haber pasado el refinement gate.
2. Un ítem no pasa a `review` con ACs sin marcar.
3. Ningún ítem se marca `done` sin deploy real.
4. Un ítem `ready` que recibe un fix post-QA vuelve a `doing` y pierde la certificación.
5. Los ítems no completados en el timebox del sprint vuelven al pool, conservando su refinamiento.
6. Todo tech debt detectado en QA o retrospectiva genera un issue nuevo, sin status.
7. **Nada se anota en el changelog hasta que se publica.** Un ítem sin issue visible está perdido.

---

## 5. Plantilla de ítem

```markdown
### [Summary] Título corto en imperativo

- **Refined:** no — falta: ACs medibles
- **Status:** (empty)
- **Prioridad:** P1
- **Problem:** [Qué está roto o falta, desde la perspectiva del usuario]
- **Scope:** [Qué entra explícitamente]
- **Out of scope:** [Qué NO entra, para evitar scope creep]
- **Acceptance Criteria:**
  - [ ] AC medible 1
  - [ ] AC medible 2
- **Verification:** [test headless / check manual / medición]
```