import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, //Nos permite definir un componente independiente, para utilizar el bootstrapApplication
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {     
  protected readonly title = signal('sampler-app');
}
// Definimos el componente raiz de la aplicacion con el decorador Component