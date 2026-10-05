# Stack Pack: PWA

Skills opcionales para proyectos que se instalan como **Progressive Web App**.

## Qué incluye

| Skill | Aplica cuando |
| :--- | :--- |
| `pwa-assets-audit` | Se modifica el manifest, los íconos, el service worker o la configuración de instalación. |

## Instalación

```bash
node scripts/sync-playbook.mjs --stack pwa
```

## Alcance

Audita **declaración y coherencia de assets**: que el manifest referencie íconos que existen con las dimensiones correctas, y que el service worker tenga una estrategia de caché declarada. No implementa la PWA por vos.

## Nota

Una PWA suele ir acompañada de los packs `react` y `mobile`. Son independientes: instalá solo lo que aplique.