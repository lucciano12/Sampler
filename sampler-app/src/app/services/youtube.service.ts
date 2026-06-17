import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Sampler } from './sampler';
import { environment } from '../../environments/environment';

// Forma de la respuesta de YouTube Data API v3 para búsqueda de videos
interface YoutubeItem {
  id: { videoId: string };
}
interface YoutubeResponse {
  items: YoutubeItem[];
}

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3/search';
  private readonly apiKey = environment.youtubeApiKey;

  constructor(private http: HttpClient) {}

  // Busca el video en YouTube y devuelve el videoId para embed futuro
  enrichFromYoutube(artista: string, titulo: string): Observable<Partial<Sampler>> {
    const q = encodeURIComponent(`${artista} ${titulo}`);
    const url = `${this.baseUrl}?q=${q}&type=video&part=snippet&maxResults=1&key=${this.apiKey}`;

    return this.http.get<YoutubeResponse>(url).pipe(
      map(res => {
        const videoId = res.items?.[0]?.id?.videoId;
        return videoId ? { videoId } : {};
      }),
      // Si la API falla, devolvemos objeto vacío sin interrumpir el flujo
      catchError(() => of({}))
    );
  }
}
