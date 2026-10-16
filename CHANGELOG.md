# Changelog

Historial de versiones de DISHub (getdishub.app). Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico `0.x`
(mientras no haya versión 1.0 los cambios grandes suben el segundo número).

Cómo agregar una versión nueva:
1. Sumar la entrada arriba, bajo `[Sin publicar]` → renombrar con la versión y la fecha.
2. `git tag -a vX.Y.Z -m "resumen"` sobre el commit.
3. `git push forgejo main --tags` (no usar `-u`).

## [Sin publicar]

## [0.5.0] - 2026-10-16
### Agregado
- Página `/cartas` con las cartas de ejemplo por rubro (sumada al sitemap).
- Página `/hub` y componente `HubPropio`.
- Cartas de ejemplo Ardente y Ronnin en `public/ejemplos/`.
### Cambiado
- Ajustes en `CartasEjemplo`, rubros y navegación compartida.

## [0.4.2] - 2026-10-15
### Cambiado
- SEO: se quitó `offers` del schema `Service`; Search Console lo interpretaba como un producto.

## [0.4.1] - 2026-10-14
### Cambiado
- Carta de ejemplo de PESTO: el número de WhatsApp queda vacío.

## [0.4.0] - 2026-10-14
### Agregado
- La carta de LUGO se suma a "Cartas hechas con DISHub".

## [0.3.2] - 2026-10-14
### Agregado
- Enlace al Instagram de DISHub en el pie de página y en el schema.

## [0.3.1] - 2026-10-14
### Cambiado
- Descripción de PESTO ajustada en las cartas de ejemplo.

## [0.3.0] - 2026-10-14
### Agregado
- Páginas por rubro.
- Cartas de ejemplo.
- Tarjeta de fidelización en el roadmap.

## [0.2.1] - 2026-10-14
### Seguridad
- `@tanstack/react-start` actualizado a 1.169.1 (CVE-2026-102989).

## [0.2.0] - 2026-10-14
### Cambiado
- Reposicionamiento: DISHub pasa a ser un hub gastronómico, con un MVP de carta digital.

## [0.1.0] - 2026-06-29
### Agregado
- Commit inicial: estructura base del proyecto (TanStack Start + React + Vite).
