import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AudioDbService } from './audiodb.service';
import { AcousticBrainzService } from './acousticbrainz.service';
import { DiscogsService } from './discogs.service';

export interface Sampler {
  titulo: string;        // Título del sampler
  artista: string;       // Artista del sampler
  fuente: string;        // Fuente del sampler
  enlace: string;        // Enlace al sampler
  descripcion?: string;  // Descripción del sampler

  // Metadatos extendidos
  key?: string;          // ej: "Am"
  tempo?: number;        // ej: 92
  genero?: string;       // ej: "R&B"
  estilo?: string;       // ej: "Nostalgia"

  // Multimedia
  portada?: string;      // URL de la imagen de portada
  id?: string;           // Optional ID

  // Colecciones
  plataformas?: { nombre: string; tipo: 'stream' | 'video'; url: string }[];
  comentarios?: { usuario: string; texto: string }[];
}

@Injectable({ providedIn: 'root' })
export class SamplerService {
  private mockUrl = 'assets/mock/samplers.json';

  constructor(
    private http: HttpClient,
    private audioDb: AudioDbService,
    private acoustic: AcousticBrainzService,
    private discogs: DiscogsService,
  ) {}

  // Enriquece un Sampler con las 3 APIs externas en paralelo
  private enrichOne(s: Sampler): Observable<Sampler> {
    return forkJoin({
      audio:    this.audioDb.enrichFromAudioDb(s.artista, s.titulo),
      acoustic: this.acoustic.enrichFromAcousticBrainz(s.artista, s.titulo),
      disc:     this.discogs.enrichFromDiscogs(s.artista, s.titulo),
    }).pipe(
      map(({ audio, acoustic, disc }) => {
        const enriched: Sampler = {
          ...s,
          tempo:   s.tempo   ?? acoustic.tempo ?? audio.tempo,
          key:     s.key     ?? acoustic.key,
          genero:  s.genero  ?? audio.genero,
          portada: s.portada ?? disc.portada,
          estilo:  s.estilo  ?? disc.estilo,
        };
        console.log('[DEBUG enrichOne]', s.titulo, {
          portada_mock: s.portada,
          portada_disc: disc.portada,
          portada_final: enriched.portada,
          tempo_final: enriched.tempo,
          genero_final: enriched.genero,
        });
        return enriched;
      })
    );
  }

  // Obtiene los samplers del mock y los enriquece
  getSampler(): Observable<{ samplers: Sampler[] }> {
    return this.http.get<{ samplers: Sampler[] }>(this.mockUrl).pipe(
      switchMap(({ samplers }) => forkJoin(samplers.map(s => this.enrichOne(s)))),
      map(samplers => ({ samplers }))
    );
  }

  // Busca releases en Discogs por estilo y los enriquece con BPM y Key
  buscarPorEstilo(estilo: string): Observable<Sampler[]> {
    return this.discogs.buscarPorEstilo(estilo).pipe(
      switchMap(samplers => {
        if (!samplers.length) return of([]);
        return forkJoin(samplers.map(s => this.enrichOne(s)));
      })
    );
  }
}
