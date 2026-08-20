import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Sampler } from './sampler';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AcousticBrainzService {


  constructor(private http: HttpClient) {}

  enrichFromAcousticBrainz(artista: string, titulo: string): Observable<Partial<Sampler>> {
    return this.http.get<{ tempo: number | null; key: string | null }>(
      `${environment.apiUrl}/api/acousticbrainz`,
      { params: { artista, titulo } }
    ).pipe(
      map(r => {
        const resultado: Partial<Sampler> = {};
        if (r.tempo) resultado.tempo = r.tempo;
        if (r.key)   resultado.key   = r.key;
        return resultado;
      }),
      catchError((err) => {
        console.warn('[ERROR AcousticBrainz]', artista, titulo, err.status);
        return of({});
      })
    );
  }
}
