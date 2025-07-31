import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"; // Importamos HttpClient y el interceptor de dependencias
import { NgModule } from "@angular/core";

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi()) // Proporcionamos HttpClient con interceptores desde la inyección de dependencias
  ],
})
export class AppModule { } //Exportamos el módulo principal de la aplicación  