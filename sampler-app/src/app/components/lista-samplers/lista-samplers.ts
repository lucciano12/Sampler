import { Component, OnInit } from '@angular/core'; // Importamos los decoradores Component y OnInit de Angular
import { SamplerService, Sampler } from '../../services/sampler'; // Importamos el servicio Sampler y la interfaz Sampler
import { NgIf, NgFor } from '@angular/common'; // Importamos NgIf y NgFor para usar en la plantilla
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-lista-samplers',
  standalone: true, // Indicamos que este componente es independiente
  imports: [NgIf, NgFor], // Importamos NgIf y NgFor para usar en la plantilla
  templateUrl: './lista-samplers.html',
  styleUrl: './lista-samplers.scss'
})
export class ListaSamplers implements OnInit{ //El OnInit es un ciclo de vida de Angular que se ejecuta una vez que el componente ha sido inicializado
  samplers: Sampler[] = []; //Inicializamos un array de samplers
  filtered: Sampler[] = []; //Inicializamos un array de samplers filtrados

  //controles de busqueda y filtro por fuente
   q = new FormControl<string>('', { nonNullable: true }); //Control de formulario para la búsqueda
   fuente = new FormControl<string>('todas', { nonNullable: true }); //Control de formulario para el filtro por fuente

   loading = false; //Indicador de carga
   errorMsg = ''; //Mensaje de error

  constructor(private samplerService: SamplerService) { } //Inyectamos el servicio Sampler en el constructor

  ngOnInit() { //Método que se ejecuta al inicializar el componente, con el this llamamos a las propiedades y métodos de la clase
    this.loading = true; //Indicamos que estamos cargando los datos
    this.samplerService.getSampler().subscribe({
      next: ({samplers}) => {
        this.samplers = samplers; //Asignamos los samplers obtenidos del servicio al array de samplers
        this.filtered = samplers; //Asignamos los samplers obtenidos del servicio al array de samplers filtrados
        this.loading = false; //Indicamos que hemos terminado de cargar los datos
      },
      error: (e) => {  //Indicamos que ha habido un error al cargar los datos
        this.errorMsg = 'No se han podido cargar los samples del mock'; //Asignamos el mensaje de error
        this.loading = false; //Indicamos que hemos terminado de cargar los datos
        console.error(e); //Mostramos el error en la consola
      }
    });

    //Reaccionamos a los cambios en el control de búsqueda
    this.q.valueChanges.pipe(debounceTime(200)).subscribe(() => this.applyFilters());
    this.fuente.valueChanges.subscribe(() => this.applyFilters());
    
  } //Fin del método ngOnInit

  private applyFilters() { //Método para aplicar los filtros de búsqueda y fuente
    const term = normalize(this.q.value); //Normalizamos el término de búsqueda
    const fuente = this.fuente.value; //Obtenemos el valor del control de fuente 'Todas' | 'YouTube' | 'Spotify'

    //1) Filtramos por fuente si corresponde
    let base = fuente === 'todas'
      ? this.samplers //Si la fuente es 'todas', usamos todos los samplers (El ? significa "si")
      : this.samplers.filter(s => s.fuente.toLowerCase() === fuente.toLowerCase()); //Si no, filtramos por la fuente seleccionada ( : significa "si no")

    //2) Si no hay término de búsqueda, devolvemos la base filtrada por fuente
  }
}
