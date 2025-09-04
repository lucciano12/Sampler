# Sampler
Este repositorio tendra la funcionalidad de buscar y descargar el sample que eliga. Para esto la API tendra la capacidad de buscar el sample, o mejor dicho la muestra de la cancion, se debe buscar por las fuentes famosas de streaming en reproducir musica, como youtube music y spotify, o tambien youtube. 

Esta API facilitara la busqueda del sample que quisieras buscar mediante su genero o caracteristica que te puede significar en la musica como la sensacion. Ejemplo un sample mistico, contemporanio, ritmico, r&b, tecno, Melodicia, instrumentos de vientos, boombap, nostalgia, miedo, etc.

Diagrama "Lista de Samplers"

```mermaid

flowchart TD
  A[Arranque componente (ngOnInit)] --> B[Cargar datos: samplerService.getSamplers()]
  B -->|next: { samplers }| C[Guardar datos]
  C --> C1[ this.samplers = samplers ]
  C1 --> C2[ this.filtered = samplers ]
  B -->|error| D[ errorMsg = 'No pude cargar...' ]

  A --> E[Configurar formulario]
  E --> E1[q.valueChanges | debounceTime(200)]
  E --> E2[fuente.valueChanges]
  E1 --> F[applyFilter()]
  E2 --> F[applyFilter()]

  F --> G[term = normalize(q.value)]
  G --> H{fuente === 'todas'?}
  H -- Sí --> I[base = samplers]
  H -- No --> J[base = samplers.filter por fuente]

  I --> K{term vacío?}
  J --> K{term vacío?}

  K -- Sí --> L[filtered = base]
  K -- No --> M[calcular score por coincidencia]
  M --> N[filtrar score>0 y ordenar desc]
  N --> O[filtered = resultado]

  %% Leyenda funciones
  subgraph Utilidades
    U1[normalize(str): minúsculas+sin acentos]
    U2[scoreSampler(s, term): título=3x, artista=2x, desc/fuente=1x]
  end
