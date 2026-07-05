// ============================================================================
// Interfaces para las respuestas de las 3 APIs externas de música
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Discogs API — https://api.discogs.com/database/search
//    Motor de búsqueda principal de releases musicales.
//    Auth: Token por header Authorization.
// ---------------------------------------------------------------------------

/** Un release individual dentro de los resultados de búsqueda de Discogs */
export interface DiscogsSearchResult {
  /** URL de la imagen de portada del release */
  cover_image: string;
  /** Lista de estilos musicales asociados al release (ej: ["Funk", "Soul"]) */
  style?: string[];
  /** Título del release, usualmente en formato "Artista - Título" */
  title?: string;
  /** URI relativa del release en Discogs (ej: /release/12345) */
  uri?: string;
  /** Lista de géneros musicales asociados al release */
  genre?: string[];
}

/** Respuesta completa del endpoint de búsqueda de Discogs */
export interface DiscogsSearchResponse {
  /** Array de releases que coinciden con la búsqueda (hasta 25 por página) */
  results: DiscogsSearchResult[];
}

// ---------------------------------------------------------------------------
// 2. TheAudioDB API — https://www.theaudiodb.com/api/v1/json/2/searchtrack.php
//    Enriquecimiento de metadatos: BPM y género.
//    Auth: Pública (API key gratuita incluida en el endpoint).
// ---------------------------------------------------------------------------

/** Un track devuelto por TheAudioDB con metadatos musicales */
export interface AudioDbTrack {
  /** ID único del track en TheAudioDB */
  idTrack: string;
  /** Nombre del track; puede ser null si no hay dato */
  strTrack: string | null;
  /** Nombre del artista; puede ser null si no hay dato */
  strArtist: string | null;
  /** BPM (Beats Per Minute) del track como string; puede ser null si no hay dato */
  intBPM: string | null;
  /** Género musical del track como string; puede ser null si no hay dato */
  strGenre: string | null;
  /** Mood / estado de ánimo del track; puede ser null si no hay dato */
  strMood: string | null;
  /** URL de la imagen thumbnail del track; puede ser null si no hay dato */
  strThumb: string | null;
  /** URL del video musical asociado; puede ser null si no hay dato */
  strMusicVid: string | null;
  /** MusicBrainz ID del track para vincular con AcousticBrainz; puede ser null si no hay dato */
  strMusicBrainzID: string | null;
}

/** Respuesta completa del endpoint de búsqueda de tracks de TheAudioDB */
export interface AudioDbSearchResponse {
  /** Array de tracks que coinciden con la búsqueda, o null si no hay resultados */
  track: AudioDbTrack[] | null;
}

// ---------------------------------------------------------------------------
// 3. AcousticBrainz + MusicBrainz APIs
//    MusicBrainz: resuelve MBID a partir de artista + título.
//    AcousticBrainz: obtiene datos de audio de bajo nivel (BPM, key).
//
//    Endpoints:
//    - MusicBrainz:  https://musicbrainz.org/ws/2/recording/
//    - AcousticBrainz: https://acousticbrainz.org/api/v1/{mbid}/low-level
//    Auth: Ambas públicas.
// ---------------------------------------------------------------------------

/** Una grabación (recording) devuelta por la búsqueda de MusicBrainz */
export interface MusicBrainzRecording {
  /** MusicBrainz ID único de la grabación */
  id: string;
}

/** Respuesta completa del endpoint de búsqueda de grabaciones de MusicBrainz */
export interface MusicBrainzSearchResponse {
  /** Array de grabaciones que coinciden con la búsqueda */
  recordings: MusicBrainzRecording[];
}

/** Datos de audio de bajo nivel devueltos por AcousticBrainz */
export interface AcousticBrainzLowLevel {
  /** Información rítmica del track */
  rhythm: {
    /** BPM (Beats Per Minute) detectado por análisis de audio */
    bpm: number;
  };
  /** Información tonal del track */
  tonal: {
    /** Tonalidad musical (ej: "A", "B", "C#") */
    key_key: string;
    /** Escala musical (ej: "minor", "major") */
    key_scale: string;
  };
}
