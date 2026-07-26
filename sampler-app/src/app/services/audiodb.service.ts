import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Sampler } from './sampler';

// Forma de la respuesta de TheAudioDB para tracks
interface AudioDbTrack {
  intBPM: string | null;
  strGenre: string | null;
  strMood: string | null;
}
interface AudioDbResponse {
  track: AudioDbTrack[] | null;
}

@Injectable({ providedIn: 'root' })
export class AudioDbService {
  // Endpoint público gratuito de TheAudioDB (sin auth)
  private readonly baseUrl = 'https://www.theaudiodb.com/api/v1/json/2/searchtrack.php';

  constructor(private http: HttpClient) {}

  // Busca el track en TheAudioDB y devuelve los campos que puede enriquecer
  enrichFromAudioDb(artista: string, titulo: string): Observable<Partial<Sampler>> {
    const url = `${this.baseUrl}?s=${encodeURIComponent(artista)}&t=${encodeURIComponent(titulo)}`;

    return this.http.get<AudioDbResponse>(url).pipe(
      map(res => {
        const track = res.track?.[0];
        if (!track) return {};

        const resultado: Partial<Sampler> = {};

        // Solo asignamos tempo si es un número finito válido
        const bpm = parseInt(track['intBPM'] ?? '', 10);
        if (isFinite(bpm) && bpm > 0) resultado.tempo = bpm;

        // Solo asignamos genero si viene con valor
        if (track.strGenre) resultado.genero = track.strGenre;

        // Mood como estilo
        if (track.strMood) resultado.estilo = track.strMood;

        return resultado;
      }),
      // Si la API falla, devolvemos objeto vacío sin interrumpir el flujo
      catchError(err => { console.warn('[ERROR AudioDB]', artista, titulo, err.status); return of({}); })
    );
  }
}
