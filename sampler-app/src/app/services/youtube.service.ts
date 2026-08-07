import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' }) // Inyecta el servicio en la raíz de la aplicación, para que esté disponible en cualquier componente
export class YoutubeService { // Define un servicio de Angular llamado YoutubeService
  private backendUrl = 'http://localhost:3000/api/youtube'; 

  constructor(private http: HttpClient) {}

  getVideoId(artista: string, titulo: string): Observable<string | null> {
    const q = `${artista} ${titulo}`;
    return this.http.get<{ videoId: string }>(this.backendUrl, { params: { q } }).pipe( 
      map(res => res.videoId),
      catchError(() => of(null)) // si falla el backend, no rompe el catálogo
    ); //Retorna un observable que emite el videoId o null si ocurre un error
  }
}