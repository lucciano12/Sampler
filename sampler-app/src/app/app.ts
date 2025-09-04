import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListaSamplers } from './components/lista-samplers/lista-samplers';
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"; // Importamos HttpClient y el interceptor de dependencias

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListaSamplers],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {     
  protected readonly title = signal('sampler-app');
}
