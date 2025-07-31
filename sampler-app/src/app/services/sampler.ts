import { Injectable } from '@angular/core'; //Importamos el decorador Injectable de Angular
import { Observable } from 'rxjs'; //Importamos Observable de RxJS
import { HttpClient } from '@angular/common/http'; //Importamos HttpClient para hacer peticiones HTTP

//Definimos el servicio Sampler
//Este servicio se encargará de manejar las peticiones relacionadas con el sampler

export interface Sampler{
  titulo: string; //Título del sampler
  artista: string; //Artista del sampler
  fuente: string; //Fuente del sampler
  enlace: string; //Enlace al sampler
  descripcion?: string; //Descripción del sampler
}

@Injectable({
  providedIn: 'root'
})
export class SamplerService {
    private mockUrl = 'assets/mock-sampler.json'; //URL del mock de datos 

    constructor(private http: HttpClient) { } //Inyectamos HttpClient en el constructor

    //Método para obtener los datos del sampler
    getSampler(): Observable<Sampler[]> {
        return this.http.get<Sampler[]>(this.mockUrl); //Realizamos una petición GET al mock y devolvemos un Observable de tipo Sampler[]
    }
}
