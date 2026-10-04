# Stack Pack: React

Skills opcionales para proyectos con **React**. No se instalan por defecto: son recetas de un stack concreto, no parte del framework.

## Qué incluye

| Skill | Aplica cuando |
| :--- | :--- |
| `forms-rhf-zod` | Se crea o modifica un formulario con React Hook Form + Zod. |
| `ui-radix-tailwind` | Se construyen componentes sobre primitivos Radix estilados con Tailwind. |
| `recharts-reporting` | Se construyen gráficos, dashboards o vistas de estadísticas con Recharts. |

## Instalación

```bash
node scripts/sync-playbook.mjs --stack react
```

## Dependencias esperadas

Estas skills asumen que el proyecto ya tiene:

- `react` · `react-dom`
- `tailwindcss`
- `@radix-ui/*` (para `ui-radix-tailwind`)
- `react-hook-form` · `zod` · `@hookform/resolvers` (para `forms-rhf-zod`)
- `recharts` (para `recharts-reporting`)

> Si tu proyecto usa otra librería de formularios, gráficos o primitives de UI, **no instales este pack**: adaptá las reglas a tu stack en `.agents/rules/` en lugar de forzar las de acá.

## Nota sobre el backend

Los ejemplos de integración de estas skills asumen un backend con una capa de autorización por fila y un cliente con API propia. **Reemplazalos por los de tu proyecto**: el framework no dicta tu backend.