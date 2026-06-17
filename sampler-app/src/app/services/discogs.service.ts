import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Sampler } from './sampler';
import { environment } from '../../environments/environment';

// Forma de la respuesta de Discogs para búsqueda de releases
interface DiscogsResult {
  cover_image: string;
  style?: string[];
  title?: string;
  uri?: string;
  genre?: string[];
}
interface DiscogsResponse {
  results: DiscogsResult[];
}

@Injectable({ providedIn: 'root' })
export class DiscogsService {
  private readonly baseUrl = 'https://api.discogs.com/database/search';

  private readonly headers = new HttpHeaders({
    Authorization: `Discogs token=${environment.discogsKey}`,
  });
  constructor(private http: HttpClient) {}

  // Devuelve hasta 25 releases de Discogs para un estilo dado, mapeados a Sampler
  buscarPorEstilo(estilo: string): Observable<Sampler[]> {
    const url = `${this.baseUrl}?style=${encodeURIComponent(estilo)}&type=release&per_page=25`;
    return this.http.get<DiscogsResponse>(url, { headers: this.headers }).pipe(
      map(res => (res.results ?? []).map(r => {
        const parts = (r.title ?? '').split(' - ');
        return {
          artista:      parts[0] ?? '',
          titulo:       parts.slice(1).join(' - ') || (r.title ?? ''),
          portada:      r.cover_image,
          genero:       r.genre?.[0] ?? '',
          estilo:       r.style?.[0] ?? '',
          fuente:       'Discogs',
          enlace:       'https://www.discogs.com' + (r.uri ?? ''),
          descripcion:  r.style?.join(', ') ?? '',
          plataformas:  [],
          comentarios:  [],
        } as Sampler;
      })),
      catchError(() => of([]))
    );
  }

  // Busca el release en Discogs y devuelve portada y estilo
  enrichFromDiscogs(
    artista: string,
    titulo: string,
  ): Observable<Partial<Sampler>> {
    const q = encodeURIComponent(`${artista} ${titulo}`);
    const url = `${this.baseUrl}?q=${q}&type=release`;

    return this.http.get<DiscogsResponse>(url, { headers: this.headers }).pipe(
      map((res) => {
        console.log('[DEBUG RAW Discogs]', artista, titulo, res);
        const primer = res.results?.[0];
        if (!primer) return {};

        const resultado: Partial<Sampler> = {};

        if (primer.cover_image) resultado.portada = primer.cover_image;
        if (primer.style?.length) resultado.estilo = primer.style[0];

        return resultado;
      }),
      // Si la API falla, devolvemos objeto vacío sin interrumpir el flujo
      catchError((err) => {
        console.error(
          '[DEBUG ERROR Discogs]',
          artista,
          titulo,
          err.status,
          err.message,
        );
        return of({});
      }),
    );
  }
}
