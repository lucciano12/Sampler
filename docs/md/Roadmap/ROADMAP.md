# 🗺️ Roadmap de Fases — Sampler

## Fase 1 — Frontend puro (estado actual)
- Angular llama directo a Discogs, TheAudioDB y AcousticBrainz
- Keys expuestas en el bundle via environment
- Favoritos en localStorage

## Fase 2 — Node.js + Express (próximo)
Endpoints a construir:
- GET /api/samplers?estilo=Funk → proxy a Discogs
- GET /api/samplers/enrich?artista=&titulo= → forkJoin de las 3 APIs externas
- GET /api/youtube?q=artista+titulo → búsqueda de videoId con YouTube Data API v3
- POST /api/favoritos → persistencia en base de datos
- GET /api/favoritos/:userId → obtener favoritos del usuario

Beneficios:
- API keys seguras en variables de entorno del servidor
- Caché server-side (evita rate limit de Discogs)
- Favoritos sincronizados entre dispositivos
- YouTube embed con videoId real

## Fase 3 — Migración a NestJS
- Mismos endpoints, misma lógica
- Módulos, controladores, servicios con decoradores
- Inyección de dependencias igual que Angular
