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
    private mockUrl = 'assets/mock/samplers.json'; //Ruta del mock JSON que contiene los datos del sampler

    constructor(private http: HttpClient) { } //Inyectamos HttpClient en el constructor

    //*Método para obtener los datos del sampler*
    getSampler(): Observable< {samplers: Sampler[]}> { //Devolvemos un Observable que emite un objeto con un array de samplers
        return this.http.get<{samplers:Sampler[]}>(this.mockUrl); //Realizamos una petición GET al mock y devolvemos un Observable de tipo Sampler[]
    }
}
