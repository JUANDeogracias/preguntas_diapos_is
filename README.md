# Preguntas IS — Tema 2

Aplicación web local (sin backend) para practicar preguntas tipo test del
Tema 2 de Ingeniería del Software. Ver [CLAUDE.md](./CLAUDE.md) para el
objetivo del proyecto y [docs/PROJECT_STATE.md](./docs/PROJECT_STATE.md)
para el estado actual.

## Stack

Vite + React + TypeScript + Tailwind CSS. Persistencia en `localStorage`.

## Requisitos

Node.js ya instalado en el sistema. **Este equipo no tiene `npm` instalado**,
por lo que el gestor de paquetes usado en este proyecto es `pnpm`, ejecutado
a través de Corepack (incluido con Node):

```bash
corepack prepare pnpm@9.15.0 --activate
corepack pnpm install
```

(pnpm 12.x, la versión "latest" en el momento de escribir esto, falla al
activarse con esta versión de Corepack; 9.15.0 funciona de forma fiable).

## Scripts

```bash
corepack pnpm dev                 # servidor de desarrollo
corepack pnpm build                # type-check + build de producción
corepack pnpm preview               # sirve el build de producción
corepack pnpm test                  # tests (vitest)
corepack pnpm run validate:questions   # valida el esquema del banco de preguntas
corepack pnpm run find:duplicates      # detecta preguntas duplicadas por enunciado
corepack pnpm run question:stats       # recuento de preguntas por bloque y dificultad
```
