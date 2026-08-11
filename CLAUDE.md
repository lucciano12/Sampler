# Sampler — Contexto para Claude Code

## Sobre Sampler
Sampler es una aplicación web para buscar y descubrir samples musicales.
Tiene un frontend Angular 20 con Bootstrap 5 dark theme (estilo Spotify) desplegado en Vercel,
y un backend Node.js + Express 5 desplegado en Render que proxyfca las APIs externas
(Discogs, YouTube, AcousticBrainz).

## Arquitectura

```
Frontend: sampler-app/ → Angular 20 → Vercel (https://sampler-lp.vercel.app)
Backend:  sampler-api/ → Node.js + Express 5 → Render (https://sampler-024y.onrender.com)
```

**Principio rector**: Angular llama SOLO al backend propio (`${apiUrl}/api/*`).
Nunca a APIs externas directamente. Única excepción: TheAudioDB
(API pública con CORS habilitado, sin key — llamada directa desde `audiodb.service.ts`).

**Por qué existe el proxy backend:**
- **Discogs**: tenía CORS bloqueado desde el navegador + la key (`DISCOGS_KEY`) es secreta y no debe exponerse en el bundle
- **YouTube**: la key (`YOUTUBE_API_KEY`) es secreta
- **AcousticBrainz**: el backend resuelve el waterfall MusicBrainz → MBID → AcousticBrainz internamente; el frontend hace una sola llamada simple

## Tu rol
- Ayudás a mejorar, debuggear y mantener el proyecto (frontend + backend)
- El código y comentarios van en español
- La UI es dark theme (verde `#1ed760` sobre fondo oscuro `#191414`)

## Arquitectura de APIs — Discogs > TheAudioDB > AcousticBrainz
SamplerService orquesta 4 fuentes con `forkJoin` y prioridad de campos:
- Si Discogs tiene el dato, AudioDB y AcousticBrainz no lo pisan
- Si Discogs no lo tiene, AudioDB lo completa
- Si ninguna lo tiene, AcousticBrainz lo aporta (solo campos técnicos: BPM, key)
- YouTube aporta `videoId` para el embed
- Cada fuente tiene su propio `catchError` que devuelve `[]` o `null` — nunca rompen el catálogo

### Roles de cada API
- **Discogs**: búsqueda base, portada, género, estilo — **proxy del backend** (`/api/discogs/search`, `/api/discogs/enrich`). La key vive solo en el servidor.
- **TheAudioDB**: tempo (intBPM), género (strGenre), mood (strMood) — **directa desde Angular** (pública, sin key, CORS habilitado)
- **AcousticBrainz**: tempo (rhythm.bpm) y key (tonal.key_key + key_scale) — **proxy del backend** (`/api/acousticbrainz`). El backend resuelve MusicBrainz → MBID → AcousticBrainz en dos pasos internos.
- **YouTube**: videoId para embed — **proxy del backend** (`/api/youtube`). La key vive solo en el servidor.
- **MusicBrainz**: paso intermedio interno del backend para resolver el MBID. El frontend no lo llama.

### Qué aporta cada API
- **Discogs**: título, artista, portada, género, estilo, enlace
- **TheAudioDB**: tempo (intBPM), género (strGenre), mood/estilo (strMood)
- **AcousticBrainz**: tempo (rhythm.bpm) y key (tonal.key_key + key_scale, formato corto: "Am", "C", "F#m")
- **YouTube**: videoId para embed de YouTube

### Regla de prioridad de campos — mergeConPrioridad()
Patrón waterfall: cada campo se llena con la primera fuente que lo tenga (según el merge real en `sampler.ts`):

| Campo | Prioridad |
|---|---|
| título | Discogs |
| artista | Discogs |
| portada | Discogs |
| género | Discogs ?? AudioDB (strGenre) |
| estilo | Discogs ?? AudioDB (strMood) |
| tempo (BPM) | AcousticBrainz ?? AudioDB (intBPM) |
| key | AcousticBrainz (único con precisión; "Am", "C", "F#m") |
| videoId | YouTube (proxy `/api/youtube`) |
| plataformas | union de todas las APIs (no se pisan, se suman) |

### Límites de API
- Discogs: `per_page=10` (límite conservador para evitar rate limit 429)
- Rate limit del backend propio: 100 req/min sobre todas las rutas `/api/`
- Debounce de búsqueda: 600ms, mínimo 3 caracteres para disparar request

### Documentación de APIs
- `docs/openapi.yaml` — contratos de integración con las APIs externas
- `docs/openapi-backend.yaml` — endpoints propios del backend (incluye Favoritos con DB como fase futura)
- Visualizar con: `npm run docs` (desde `sampler-app/`)

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Angular** | 20.1 | Framework standalone components |
| **TypeScript** | ~5.8 | Lenguaje tipado |
| **Node.js** | 22 | Runtime del backend |
| **Express** | 5.2 | Framework HTTP del backend |
| **axios** | ^1.19 | Cliente HTTP del backend (llamadas a APIs externas) |
| **Bootstrap** | 5.3.8 | UI components & grid |
| **Bootstrap Icons** | 1.13.1 | Iconografía |
| **SCSS** | — | Estilos avanzados |
| **RxJS** | ~7.8 | Observables, debounceTime, forkJoin |
| **Angular Reactive Forms** | — | FormControl para búsqueda |
| **Karma + Jasmine** | — | Testing unitario (frontend) |

---

## 📁 Estructura del Proyecto

```
sampler/                              ← Raíz del repositorio
├── CLAUDE.md                         ← Este archivo
├── README.md                         ← Documentación principal del proyecto
├── docs/                             ← Documentación de diseño (diagramas, mockups)
│   ├── openapi.yaml                  ← Contratos de APIs externas
│   ├── openapi-backend.yaml          ← Endpoints propios del backend
│   ├── Componentes/Lista Sampler/
│   ├── Idea + Proyeccion/
│   ├── MVP API/
│   └── Plan de estudio + Construccion UI/
│
├── sampler-api/                      ← Backend Node.js + Express
│   ├── index.js                      ← Entry point (dotenv + app.listen)
│   ├── package.json                  ← express ^5, axios, cors, dotenv, express-rate-limit
│   ├── .env                          ← Variables de entorno (gitignoreado)
│   └── src/
│       ├── app.js                    ← Express app, CORS, rate limit, routers
│       ├── middlewares/
│       │   └── rateLimiter.js        ← 100 req/min sobre /api/
│       └── routes/
│           ├── youtube.js            ← GET /api/youtube?q=
│           ├── discogs.js            ← GET /api/discogs/search y /api/discogs/enrich
│           └── acousticbrainz.js     ← GET /api/acousticbrainz?artista=&titulo=
│
└── sampler-app/                      ← Aplicación Angular
    ├── src/
    │   ├── index.html
    │   ├── main.ts                    ← Punto de entrada (bootstrapApplication)
    │   │
    │   ├── app/
    │   │   ├── app.ts                 ← Componente raíz standalone
    │   │   ├── app.html               ← Template raíz (<app-lista-samplers>)
    │   │   ├── app.scss               ← Estilos globales (Bootstrap import)
    │   │   ├── app.config.ts          ← Proveedores de la aplicación
    │   │   ├── app.routes.ts          ← Rutas (actualmente vacío)
    │   │   │
    │   │   ├── components/
    │   │   │   └── lista-samplers/
    │   │   │       ├── lista-samplers.ts    ← Lógica del catálogo
    │   │   │       ├── lista-samplers.html  ← Template (grid, offcanvas)
    │   │   │       ├── lista-samplers.scss  ← Estilos (dark theme)
    │   │   │       └── lista-samplers.spec.ts
    │   │   │
    │   │   ├── services/
    │   │   │   ├── sampler.ts                ← SamplerService (orquestador)
    │   │   │   ├── sampler.spec.ts
    │   │   │   ├── discogs.service.ts        ← Discogs (proxy backend)
    │   │   │   ├── audiodb.service.ts        ← TheAudioDB (directa)
    │   │   │   ├── acousticbrainz.service.ts ← AcousticBrainz (proxy backend)
    │   │   │   ├── youtube.service.ts        ← YouTube (proxy backend)
    │   │   │   └── favoritos.service.ts      ← Favoritos (localStorage + signals)
    │   │   │
    │   │   └── models/
    │   │       └── api-responses.ts          ← Interfaces de las APIs externas
    │   │
    │   ├── assets/mock/
    │   │   └── samplers.json          ← Datos mock (fallback / desarrollo)
    │   │
    │   ├── environments/
    │   │   ├── environment.ts          ← Dev (auto-generado)
    │   │   └── environment.prod.ts     ← Prod (auto-generado)
    │   │
    │   └── styles/
    │       ├── app.scss                ← Entry point de estilos globales
    │       ├── variables.scss          ← Variables SCSS (override Bootstrap)
    │       └── background.scss         ← Gradiente de fondo
    │
    ├── generate-env.js                 ← Genera environment.ts desde .env / process.env
    ├── vercel.json                     ← Config de deploy (buildCommand, outputDirectory)
    ├── .nvmrc                         ← Node 22
    ├── angular.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── .env                            ← Variables de entorno locales
    ├── .env.example                    ← Template de variables de entorno
    ├── .editorconfig
    └── .vscode/
        ├── extensions.json             ← Recomienda Angular extension
        └── launch.json                 ← Debug config (ng serve, ng test)
```

---

## 🖥️ Backend — sampler-api/

Desplegado en Render: `https://sampler-024y.onrender.com`

### Endpoints propios

| Método | Ruta | Params | Respuesta |
|---|---|---|---|
| `GET` | `/api/youtube` | `q` (requerido) | `{ videoId }` — 400 si falta `q`, 404 si no hay resultados |
| `GET` | `/api/discogs/search` | `style`, `q`, `per_page` (default 10) | Resultados de Discogs proxeados. Errores → 502 con `{ results: [] }` |
| `GET` | `/api/discogs/enrich` | `artista`, `titulo` | Release único de Discogs (`per_page=1`). Errores → 502 con `{ results: [] }` |
| `GET` | `/api/acousticbrainz` | `artista`, `titulo` | `{ tempo: number\|null, key: string\|null }`. Nunca 502 — en error devuelve nulls |

### Waterfall interno de AcousticBrainz
El endpoint `/api/acousticbrainz` ejecuta dos pasos secuenciales:
1. MusicBrainz: `musicbrainz.org/ws/2/recording/?query=recording:"titulo" AND artist:"artista"&fmt=json&limit=1` → obtiene el MBID
2. AcousticBrainz: `acousticbrainz.org/api/v1/{mbid}/low-level` → extrae `rhythm.bpm` y `tonal.key_key`/`key_scale`

Si no hay MBID o falla cualquiera de los dos pasos, devuelve `{ tempo: null, key: null }` sin error HTTP.

### CORS
Whitelist exacta: `http://localhost:4200` (dev) y `https://sampler-lp.vercel.app` (prod).
Cualquier otro origen es bloqueado.

### Rate limiting
`express-rate-limit` v8: 100 requests por minuto sobre todas las rutas `/api/`.
Mensaje de rechazo: `{ error: 'Demasiadas peticiones, espere un momento' }`.

---

## 🧩 Componentes

### `App` (Raíz)
- **Selector**: `app-root`
- **Ruta**: [src/app/app.ts](sampler-app/src/app/app.ts)
- **Tipo**: Standalone component
- **Props**: `title: Signal<string>`
- **Template**: Renderiza `<app-lista-samplers>`

### `ListaSamplers` (Catálogo)
- **Selector**: `app-lista-samplers`
- **Ruta**: [src/app/components/lista-samplers/](sampler-app/src/app/components/lista-samplers/)
- **Tipo**: Standalone component, implementa `OnInit`
- **Dependencias**: `SamplerService`, `FormControl`, `DomSanitizer`, `Offcanvas` (Bootstrap JS)
- **Formularios reactivos**:
  - `q: FormControl<string>` — búsqueda por texto (debounce 600ms con `switchMap` que cancela la búsqueda anterior)
  - `fuente: FormControl<string>` — filtro por fuente (YouTube, Spotify, etc.)
- **Estados visuales**: `loading`, `error`, sin resultados
- **Funcionalidades**:
  - Grid responsivo de cards con portadas
  - Búsqueda en tiempo real con `switchMap` (cancela request previo si el usuario sigue escribiendo)
  - Offcanvas de detalle con tabs (Plataformas, Info/Metadatos, Comentarios)
  - Modal de zoom para portadas
  - Tap tempo (cálculo manual de BPM)
  - Embed de YouTube (videoId resuelto por `/api/youtube` vía backend; el iframe embed es público)
  - Relevance scoring para búsqueda local (título ×3, artista ×2, descripción/fuente ×1)

---

## 🔧 Servicios

### `SamplerService` — Orquestador
- **Ruta**: [src/app/services/sampler.ts](sampler-app/src/app/services/sampler.ts)
- Inyecta: `HttpClient`, `AudioDbService`, `AcousticBrainzService`, `DiscogsService`, `YoutubeService`
- **Métodos**:
  - `getSampler()`: Obtiene todos los samplers del mock JSON y los enriquece con APIs externas
  - `buscarPorEstilo(estilo)`: Busca en Discogs por estilo y enriquece resultados
  - `enrichOne(sampler)`: Enriquece un sampler con `forkJoin` de 4 llamadas en paralelo

### `DiscogsService` — Discogs API (proxy backend)
- **Ruta**: [src/app/services/discogs.service.ts](sampler-app/src/app/services/discogs.service.ts)
- **Endpoints**: `${apiUrl}/api/discogs/search` y `${apiUrl}/api/discogs/enrich`
- **Auth**: La key viaja solo en el backend (header `Authorization: Discogs token=…`)
- **Métodos**:
  - `buscarPorEstilo(estilo)`: Busca releases por estilo
  - `enrichFromDiscogs(artista, titulo)`: Obtiene portada, género y estilo
- **Manejo de errores**: `catchError` devuelve objeto vacío sin interrumpir el flujo

### `AudioDbService` — TheAudioDB API (directa)
- **Ruta**: [src/app/services/audiodb.service.ts](sampler-app/src/app/services/audiodb.service.ts)
- **Endpoint**: `https://www.theaudiodb.com/api/v1/json/2/searchtrack.php` (directa desde el navegador)
- **Auth**: Pública (API key gratuita incluida en el endpoint)
- **Métodos**:
  - `enrichFromAudioDb(artista, titulo)`: Obtiene tempo (`intBPM`), género (`strGenre`) y mood (`strMood`)

### `AcousticBrainzService` — AcousticBrainz (proxy backend)
- **Ruta**: [src/app/services/acousticbrainz.service.ts](sampler-app/src/app/services/acousticbrainz.service.ts)
- **Endpoint**: `${apiUrl}/api/acousticbrainz?artista=…&titulo=…` (una sola llamada simple)
- El backend resuelve internamente el waterfall MusicBrainz → MBID → AcousticBrainz
- **Métodos**:
  - `enrichFromAcousticBrainz(artista, titulo)`: Obtiene `{ tempo, key }`

### `YoutubeService` — YouTube (proxy backend)
- **Ruta**: [src/app/services/youtube.service.ts](sampler-app/src/app/services/youtube.service.ts)
- **Endpoint**: `${apiUrl}/api/youtube?q=artista+titulo`
- **Métodos**:
  - `buscarVideo(artista, titulo)`: Obtiene `{ videoId }` para el embed

### `FavoritosService` — Favoritos locales
- **Ruta**: [src/app/services/favoritos.service.ts](sampler-app/src/app/services/favoritos.service.ts)
- **Funcionamiento**: localStorage + Signals. Sin backend (los endpoints de Favoritos en `openapi-backend.yaml` son fase futura).

---

## 🌐 APIs Externas

| API | Acceso | Auth | Datos que Provee | ¿Esencial? |
|---|---|---|---|---|
| **Discogs** | Proxy backend | `DISCOGS_KEY` (solo servidor) | Portada, género, estilo, releases | Sí — motor de búsqueda |
| **TheAudioDB** | Directa Angular | Pública (sin key) | BPM, género, mood | No — enriquecimiento |
| **AcousticBrainz** | Proxy backend | Pública | BPM, key musical | No — enriquecimiento |
| **MusicBrainz** | Proxy backend (interno) | Pública | MBID (para AcousticBrainz) | No — paso intermedio |
| **YouTube Data API v3** | Proxy backend | `YOUTUBE_API_KEY` (solo servidor) | videoId para embed | No — enriquecimiento |

Todas las APIs tienen **manejo de errores resiliente**: si una falla, las demás continúan y el sampler igual se muestra con los datos disponibles. El backend responde con cuerpos JSON estables (`{ results: [] }`, `{ tempo: null, key: null }`) para no romper el waterfall del frontend.

---

## 🔐 Variables de Entorno

### Backend — sampler-api/ (Render)

| Variable | Descripción | Requerida |
|---|---|---|
| `PORT` | Puerto del servidor (default: `3000`) | No |
| `YOUTUBE_API_KEY` | Key de YouTube Data API v3 | ✅ Sí |
| `DISCOGS_KEY` | Token personal de Discogs | ✅ Sí |

Configuradas como Environment Variables en el dashboard de Render.
En local se leen desde `sampler-api/.env` (gitignoreado).

### Frontend — sampler-app/ (Vercel)

| Variable | Descripción |
|---|---|
| `API_URL` | URL del backend. Dev: `http://localhost:3000` · Prod: `https://sampler-024y.onrender.com` |

El frontend **NO necesita `DISCOGS_KEY` ni `YOUTUBE_API_KEY`**: las keys viven solo en el backend.

### Generación automática de environments
El script [generate-env.js](sampler-app/generate-env.js) hardcodea `apiUrl` según el entorno
(dev → `http://localhost:3000`, prod → `https://sampler-024y.onrender.com`) y genera:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Se ejecuta automáticamente como `prebuild` antes de `ng build`.
`API_URL` en `.env` es una convención documentada; el valor real lo asigna `generate-env.js`.

**⚠️ Importante**: Los archivos de environment son **auto-generados**. No editar manualmente.

---

## 🔄 Flujo de Datos

```
Usuario escribe estilo → buscarPorEstilo("Funk")
  ↓
DiscogsService.buscarPorEstilo() → GET {apiUrl}/api/discogs/search?style=Funk (backend propio)
  ↓
sampler-api → api.discogs.com/database/search (header con DISCOGS_KEY en el servidor)
  ↓
Releases mapeadas a objetos Sampler
  ↓
Por cada sampler → enrichOne() con forkJoin (4 llamadas en paralelo):
  ├── DiscogsService.enrichFromDiscogs()    → /api/discogs/enrich      → portada, género, estilo
  ├── AcousticBrainzService                 → /api/acousticbrainz       → tempo, key
  │     └─ backend: MusicBrainz → MBID → AcousticBrainz (2 pasos internos)
  ├── YoutubeService.buscarVideo()          → /api/youtube?q=…         → videoId
  └── AudioDbService.enrichFromAudioDb()    → theaudiodb.com (DIRECTO) → BPM, género, mood
  ↓
mergeConPrioridad() aplica waterfall Discogs > AudioDB > AcousticBrainz
  ↓
Samplers enriquecidos se muestran en grid de cards
  ↓
Usuario escribe en input q → applyFilters() con debounce 600ms
  ↓
Filtrado local con relevance scoring (título: 3pto, artista: 2pto, descripción: 1pto)
  ↓
Grid actualizada con resultados ordenados por relevancia
```

**Flujo alternativo — carga inicial con mock:**
```
getSampler() → assets/mock/samplers.json → enrichOne() por cada sampler → display
```

---

## 🧪 Testing

- **Frontend — Framework**: Jasmine + Karma
- **Runner**: `@angular/build:karma` (Angular CLI integrado)
- **Tests actuales**:
  - `app.spec.ts` — smoke test del componente raíz
  - `lista-samplers.spec.ts` — smoke test del componente de lista
  - `sampler.spec.ts` — smoke test del servicio
- **Ejecutar**: `npm test` (desde `sampler-app/`)
- **Backend**: aún no tiene tests (el script `test` en `sampler-api/package.json` es un placeholder `exit 1`)

---

## 🚀 Comandos Útiles

| Comando | Dónde | Descripción |
|---|---|---|
| `npm start` | `sampler-app/` | Dev frontend → `localhost:4200` |
| `npm start` | `sampler-api/` | Dev backend → `localhost:3000` |
| `npm run build` | `sampler-app/` | Build de producción → `dist/sampler-app` |
| `npm test` | `sampler-app/` | Ejecutar tests unitarios |
| `npm run prebuild` | `sampler-app/` | Generar archivos de environment |

---

## 📐 Convenios de Código

### Frontend (Angular)
- **Componentes**: Standalone (`standalone: true`), sin NgModules
- **Rutas**: Usar `provideRouter` en appConfig
- **Estilos**: SCSS con variables compartidas
- **APIs**: Servicios inyectables con `providedIn: 'root'`
- **Manejo de errores APIs**: `catchError` → devolver objeto vacío, nunca bloquear el flujo principal
- **Reactive Forms**: Preferir `FormControl` sobre `ngModel`
- **RxJS**: Usar `pipe()` con operadores declarativos
- **Mock data**: `assets/mock/samplers.json` como fallback en desarrollo

### Backend (Express)
- **Rutas**: Un archivo por dominio en `sampler-api/src/routes/`
- **Manejo de errores**: Responder con cuerpos JSON estables (`{ results: [] }`, `{ tempo: null, key: null }`) para no romper el waterfall del frontend
- **Logging**: `console.error` con prefijo `[Ruta]` para identificar el origen
- **CORS**: Whitelist explícita de orígenes (nunca `*`)

---

## 🔮 Roadmap (del README principal)

### Corto Plazo (v0.1.0)
- ✅ Agregar `coverUrl` a interfaz Sampler
- ✅ Reemplazar template con grid estilo Splice
- ✅ Estilos SCSS para cards mejoradas
- ⬜ Lazy loading de imágenes
- ⬜ Test responsivo completo

### Mediano Plazo (v0.2.0 - v0.3.0)
- ⬜ Página de home con "Hot Sampled" / trending
- ✅ Sistema de favoritos (localStorage)
- ⬜ Búsqueda avanzada (filtros por key, tempo, rango BPM)
- ⬜ Historial de búsquedas recientes
- ⬜ Más datos mock para testing

### Largo Plazo (v0.4.0+)
- ✅ Backend API propia en Node.js (MVP: 3 rutas proxy — YouTube, Discogs, AcousticBrainz)
- ⬜ Autenticación de usuarios
- ⬜ Sistema de comentarios propio
- ⬜ Playlists/colecciones de samplers
- ⬜ Estadísticas de búsqueda y trending
- ⬜ Base de datos real (MongoDB, PostgreSQL)
- ⬜ Endpoints de Favoritos con persistencia en BD
