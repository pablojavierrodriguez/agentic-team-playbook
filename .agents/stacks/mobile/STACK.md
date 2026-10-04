# Stack Pack: Mobile

Skills opcionales para equipos que entregan una **experiencia móvil**: responsive web, web app instalable o app nativa vía wrapper.

## Qué incluye

| Skill | Aplica cuando |
| :--- | :--- |
| `mobile-ux-design` | Se diseñan o auditan interfaces móviles, sheets, teclado virtual, safe areas o integración nativa. |

## Instalación

```bash
node scripts/sync-playbook.mjs --stack mobile
```

## Alcance

Cubre **mobile web responsive** y, si tu proyecto lo usa, **Capacitor** para empaquetado nativo. Si tu app es puramente nativa (iOS/Android sin web), este pack no aplica: escribí tus propias reglas.

## Dependencias

Ninguna obligatoria. Secciones específicas asumen Capacitor y sus plugins (`@capacitor/haptics`, etc.) cuando el proyecto los usa.