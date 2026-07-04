import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Sampler } from './sampler';

interface MbRecording { id: string; }
interface MbResponse  { recordings: MbRecording[]; }
interface AcbLowLevel { rhythm: { bpm: number }; tonal: { key_key: string; key_scale: string }; }

@Injectable({ providedIn: 'root' })
export class AcousticBrainzService {
  private readonly mbUrl  = 'https://musicbrainz.org/ws/2/recording/';
  private readonly acbUrl = 'https://acousticbrainz.org/api/v1';
  private readonly headers = new HttpHeaders({});

  constructor(private http: HttpClient) {}

  enrichFromAcousticBrainz(artista: string, titulo: string): Observable<Partial<Sampler>> {
    const query = encodeURIComponent(`recording:"${titulo}" AND artist:"${artista}"`);
    const mbQuery = `${this.mbUrl}?query=${query}&fmt=json&limit=1`;

    return this.http.get<MbResponse>(mbQuery, { headers: this.headers }).pipe(
      switchMap(res => {
        const mbid = res.recordings?.[0]?.id;
        if (!mbid) return of({});
        return this.http.get<AcbLowLevel>(`${this.acbUrl}/${mbid}/low-level`).pipe(
          map(acb => {
            const resultado: Partial<Sampler> = {};
            const bpm = acb?.rhythm?.bpm;
            if (bpm && isFinite(bpm) && bpm > 0) resultado.tempo = Math.round(bpm);
            const keyKey   = acb?.tonal?.key_key;
            const keyScale = acb?.tonal?.key_scale;
            if (keyKey && keyScale) resultado.key = `${keyKey} ${keyScale}`;
            return resultado;
          }),
          catchError((err) => {
            if (err.status !== 404) console.warn('[DEBUG ERROR AcousticBrainz]', artista, titulo, err.status, err.message);
            return of({});
          })
        );
      }),
      catchError(() => of({}))
    );
  }
}
