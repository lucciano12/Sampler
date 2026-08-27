import { bootstrapApplication, BrowserModule } from '@angular/platform-browser'; //Aca importamos la función bootstrapApplication de Angular para iniciar la aplicacion con sus proveedores
import { App } from './app/app'; //Importamos el componente raiz de la aplicacion
import { importProvidersFrom } from '@angular/core'; // Importamos importProvidersFrom para importar proveedores de modulos
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"; // Importamos HttpClient y el interceptor de dependencias
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; //Importamos el bundle de Bootstrap, el bundle significa que incluye Popper
import {inject} from "@vercel/analytics"; // Importamos la funcion inject de Vercel Analytics para poder inyectar el servicio de analitica en nuestra aplicacion

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(BrowserModule), // Importamos el BrowserModule para que la aplicacion pueda ejecutarse en un navegador
    provideHttpClient(withInterceptorsFromDi())
  ]
})
.then (() => inject()) //Inyectamos el servicio de analitica de Vercel para poder usarlo en nuestra aplicacion
.catch(err => console.error(err)); //Manejamos cualquier error que pueda ocurrir durante el arranque de la aplicacion


