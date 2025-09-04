# Sampler
Este repositorio tendra la funcionalidad de buscar y descargar el sample que eliga. Para esto la API tendra la capacidad de buscar el sample, o mejor dicho la muestra de la cancion, se debe buscar por las fuentes famosas de streaming en reproducir musica, como youtube music y spotify, o tambien youtube. 

Esta API facilitara la busqueda del sample que quisieras buscar mediante su genero o caracteristica que te puede significar en la musica como la sensacion. Ejemplo un sample mistico, contemporanio, ritmico, r&b, tecno, Melodicia, instrumentos de vientos, boombap, nostalgia, miedo, etc.

Diagrama "Lista de Samplers"

## Diagrama "Lista de Samplers"

```mermaid
flowchart TD
  A[ngOnInit] --> B[Cargar datos del servicio]
  B --> C[Asignar this.samplers y this.filtered]
  B --> D[Error -> errorMsg]

  A --> E[Configurar formularios]
  E --> F[Escuchar q.valueChanges]
  E --> G[Escuchar fuente.valueChanges]
  F --> H[applyFilter]
  G --> H[applyFilter]

  H --> I{fuente es todas?}
  I -- Si --> J[base = samplers]
  I -- No --> K[base = samplers filtrados por fuente]

  H --> L{term vacio?}
  L -- Si --> M[filtered = base]
  L -- No --> N[Calcular score\n(titulo 3x, artista 2x,\nfuente/desc 1x)]
  N --> O[Filtrar score > 0 y ordenar desc]
  O --> P[filtered = resultado]

  subgraph Utilidades
    U1[normalize -> minusculas sin acentos]
    U2[scoreSampler]
  end
