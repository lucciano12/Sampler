# Sampler 🎵

Buscador y catálogo de **samples musicales** (muestras predilectas de canciones) construido con **Angular 20**. Este proyecto permite explorar, buscar y descubrir samplers enriquecidos con metadatos musicales (BPM, key, género, portada) provenientes de múltiples APIs externas.

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Angular** | 20.1 | Framework standalone components |
| **TypeScript** | ~5.8 | Lenguaje tipado |
| **Bootstrap** | 5.3.8 | UI components & grid |
| **Bootstrap Icons** | 1.13.1 | Iconografía |
| **SCSS** | — | Estilos avanzados |
| **RxJS** | ~7.8 | Observables, debounceTime, forkJoin |
| **Angular Reactive Forms** | — | FormControl para búsqueda |
| **Karma + Jasmine** | — | Testing unitario |

---

## 📁 Estructura del Proyecto

```
sampler/                          ← Raíz del repositorio
├── CLAUDE.md                     ← Este archivo
├── README.md                     ← Documentación principal del proyecto
├── docs/                         ← Documentación de diseño (diagramas, mockups)
│   ├── Componentes/Lista Sampler/
│   ├── Idea + Proyeccion/
│   ├── MVP API/
│   └── Plan de estudio + Construccion UI/
│
└── sampler-app/                  ← Aplicación Angular
    ├── src/
    │   ├── index.html
    │   ├── main.ts                ← Punto de entrada (bootstrapApplication)
    │   │
    │   ├── app/
    │   │   ├── app.ts              ← Componente raíz standalone
    │   │   ├── app.html            ← Template raíz (<app-lista-samplers>)
    │   │   ├── app.scss            ← Estilos globales (Bootstrap import)
    │   │   ├── app.config.ts       ← Proveedores de la aplicación
    │   │   ├── app.routes.ts       ← Rutas (actualmente vacío)
    │   │   │
    │   │   ├── components/
    │   │   │   └── lista-samplers/
    │   │   │       ├── lista-samplers.ts    ← Lógica del catálogo
    │   │   │       ├── lista-samplers.html  ← Template (grid, offcanvas)
    │   │   │       ├── lista-samplers.scss  ← Estilos (dark theme)
    │   │   │       └── lista-samplers.spec.ts
    │   │   │
    │   │   └── services/
    │   │       ├── sampler.ts               ← SamplerService (orquestador)
    │   │       ├── sampler.spec.ts
    │   │       ├── discogs.service.ts       ← Discogs API
    │   │       ├── audiodb.service.ts       ← TheAudioDB API
    │   │       └── acousticbrainz.service.ts ← AcousticBrainz + MusicBrainz
    │   │
    │   ├── assets/mock/
    │   │   └── samplers.json       ← Datos mock (2 samplers de ejemplo)
    │   │
    │   ├── environments/
    │   │   ├── environment.ts       ← Dev (auto-generado)
    │   │   └── environment.prod.ts  ← Prod (auto-generado)
    │   │
    │   └── styles/
    │       ├── app.scss             ← Entry point de estilos globales
    │       ├── variables.scss       ← Variables SCSS (override Bootstrap)
    │       └── background.scss      ← Gradiente de fondo
    │
    ├── scripts/
    │   └── generate-env.js          ← Genera environment.ts desde .env
    │
    ├── angular.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── .env                         ← Variables de entorno locales
    ├── .env.example                 ← Template de variables de entorno
    ├── .editorconfig
    └── .vscode/
        ├── extensions.json          ← Recomienda Angular extension
        └── launch.json              ← Debug config (ng serve, ng test)
```

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
  - `q: FormControl<string>` — búsqueda por texto (debounce 200ms)
  - `estiloCtrl: FormControl<string>` — estilo musical para búsqueda en Discogs
- **Estados visuales**: `loading`, `errorMsg`, `filtered.length === 0`
- **Funcionalidades**:
  - Grid responsivo de cards con portadas
  - Offcanvas de detalle con 3 tabs (Plataformas, Info/Metadatos, Comentarios)
  - Modal de zoom para portadas
  - Tap tempo (cálculo manual de BPM)
  - Embed de YouTube (búsqueda pública sin API key)
  - Relevance scoring para búsqueda local (título ×3, artista ×2, descripción/fuente ×1)

---

## 🔧 Servicios

### `SamplerService` — Orquestador
- **Ruta**: [src/app/services/sampler.ts](sampler-app/src/app/services/sampler.ts)
- Inyecta: `HttpClient`, `AudioDbService`, `AcousticBrainzService`, `DiscogsService`
- **Métodos**:
  - `getSampler()`: Obtiene todos los samplers del mock JSON y los enriquece con APIs externas
  - `buscarPorEstilo(estilo)`: Busca en Discogs por estilo y enriquece resultados
  - `enrichOne(sampler)`: Enriquece un sampler llamando a las 3 APIs en paralelo con `forkJoin`

### `DiscogsService` — Discogs API
- **Ruta**: [src/app/services/discogs.service.ts](sampler-app/src/app/services/discogs.service.ts)
- **Endpoint**: `https://api.discogs.com/database/search`
- **Auth**: Token por header `Authorization: Discogs token=…`
- **Métodos**:
  - `buscarPorEstilo(estilo)`: Busca releases por estilo (25 resultados)
  - `enrichFromDiscogs(artista, titulo)`: Obtiene portada y estilo
- **Manejo de errores**: `catchError` devuelve objeto vacío sin interrumpir el flujo

### `AudioDbService` — TheAudioDB API
- **Ruta**: [src/app/services/audiodb.service.ts](sampler-app/src/app/services/audiodb.service.ts)
- **Endpoint**: `https://www.theaudiodb.com/api/v1/json/2/searchtrack.php`
- **Auth**: Pública (API key gratuita incluida en el endpoint, no requiere Auth)
- **Métodos**:
  - `enrichFromAudioDb(artista, titulo)`: Obtiene BPM (`intBPM`) y género (`strGenre`)

### `AcousticBrainzService` — AcousticBrainz + MusicBrainz
- **Ruta**: [src/app/services/acousticbrainz.service.ts](sampler-app/src/app/services/acousticbrainz.service.ts)
- **Endpoints**:
  - MusicBrainz: `https://musicbrainz.org/ws/2/recording/` (resuelve MBID por artista + título)
  - AcousticBrainz: `https://acousticbrainz.org/api/v1/{mbid}/low-level` (datos de audio)
- **Auth**: Pública
- **Métodos**:
  - `enrichFromAcousticBrainz(artista, titulo)`: Obtiene BPM (`rhythm.bpm`) y clave musical (`tonal.key_key` + `tonal.key_scale`)

---

## 🌐 APIs Externas

| API | Endpoint Base | Auth | Datos que Provee | ¿Esencial? |
|---|---|---|---|---|
| **Discogs** | `api.discogs.com` | Token (`DISCOGS_KEY`) | Portada, estilo, releases por estilo | Sí — motor de búsqueda principal |
| **TheAudioDB** | `theaudiodb.com/api/v1/json/2` | Pública (gratuita) | BPM, género | No — enriquecimiento |
| **AcousticBrainz** | `acousticbrainz.org/api/v1` | Pública | BPM, key musical (con MusicBrainz) | No — enriquecimiento |
| **MusicBrainz** | `musicbrainz.org/ws/2` | Pública | Recording ID (para consultar AcousticBrainz) | No — paso intermedio |

Todas las APIs externas tienen **manejo de errores resiliente**: si una falla, las demás continúan y el sampler igual se muestra con los datos disponibles (no hay error fatal).

---

## 🔐 Variables de Entorno

| Variable | Descripción | Requerida | Dónde se usa |
|---|---|---|---|
| `DISCOGS_KEY` | Token de API de Discogs | ✅ Sí | `discogs.service.ts` (Authorization header) |

### Generación automática
El script [scripts/generate-env.js](sampler-app/scripts/generate-env.js) lee `DISCOGS_KEY` del archivo `.env` o de `process.env` (Vercel) y genera:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Se ejecuta automáticamente como `prebuild` antes de `ng build`.

**⚠️ Importante**: Los archivos de environment son **auto-generados**. No editar manualmente. En local las variables viven en `.env`; en Vercel se configuran como Environment Variables del proyecto.

---

## 🔄 Flujo de Datos

```
Usuario escribe estilo → buscarPorEstilo("Funk")
  ↓
DiscogsService.buscarPorEstilo("Funk") → api.discogs.com/database/search?style=Funk
  ↓
25 releases de Discogs mapeadas a objetos Sampler
  ↓
Por cada sampler → enrichOne() llama en paralelo (forkJoin):
  ├── AudioDbService.enrichFromAudioDb()  → BPM, género
  ├── AcousticBrainzService.enrichFromAcousticBrainz() → BPM, key
  └── DiscogsService.enrichFromDiscogs()  → portada, estilo
  ↓
Samplers enriquecidos se muestran en grid de cards
  ↓
Usuario escribe en input q → applyFilters() con debounce 200ms
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

- **Framework**: Jasmine + Karma
- **Runner**: `@angular/build:karma` (Angular CLI integrado)
- **Tests actuales**:
  - `app.spec.ts` — smoke test del componente raíz
  - `lista-samplers.spec.ts` — smoke test del componente de lista
  - `sampler.spec.ts` — smoke test del servicio
- **Ejecutar**: `npm test`

---

## 🚀 Comandos Útiles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo → `localhost:4200` |
| `npm run build` | Build de producción → `dist/sampler-app` |
| `npm test` | Ejecutar tests unitarios |
| `npm run prebuild` | Generar archivos de environment |

---

## 📐 Convenios de Código

- **Componentes**: Standalone (`standalone: true`), sin NgModules
- **Rutas**: Usar `provideRouter` en appConfig (actualmente vacío)
- **Estilos**: SCSS con variables compartidas
- **APIs**: Servicios inyectables con `providedIn: 'root'`
- **Manejo de errores APIs**: `catchError` → devolver objeto vacío, nunca bloquear el flujo principal
- **Reactive Forms**: Preferir `FormControl` sobre `ngModel`
- **RxJS**: Usar `pipe()` con operadores declarativos
- **Mock data**: `assets/mock/samplers.json` como fallback en desarrollo

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
- ⬜ Sistema de favoritos (localStorage)
- ⬜ Búsqueda avanzada (filtros por key, tempo, rango BPM)
- ⬜ Historial de búsquedas recientes
- ⬜ Más datos mock para testing

### Largo Plazo (v0.4.0+)
- ⬜ Autenticación de usuarios
- ⬜ Sistema de comentarios propio
- ⬜ Playlists/colecciones de samplers
- ⬜ Estadísticas de búsqueda y trending
- ⬜ Base de datos real (MongoDB, PostgreSQL)
- ⬜ Backend API real (Node.js, Python)

---

## 🔍 Notas para Claude

- **Español**: Este proyecto está documentado principalmente en español (código fuente, comentarios, README). Mantener consistencia de idioma.
- **Estilo musical**: Al trabajar con APIs de música, usar convenciones internacionales (BPM, keys como "Am", "Bm", géneros en inglés tipo "Funk", "Soul", "Jazz").
- **Discogs**: Es la API principal para búsqueda — las otras son complementarias para enriquecer metadatos. Nunca deben bloquear si fallan.
- **La UI es dark theme**: Colores inspirados en Spotify (verde `#1ed760` sobre fondo oscuro `#191414`).
- **No hay backend propio**: Toda la lógica corre en el frontend Angular. Las APIs externas se llaman directamente desde el navegador (con CORS).
