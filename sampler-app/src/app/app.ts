import { Component, signal } from '@angular/core';
import { ListaSamplers } from './components/lista-samplers/lista-samplers';

@Component({
  selector: 'app-root',
  standalone: true, //Nos permite definir un componente independiente, para utilizar el bootstrapApplication
  imports: [ListaSamplers],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {     
  protected readonly title = signal('sampler-app');
}
// Definimos el componente raiz de la aplicacion con el decorador Component