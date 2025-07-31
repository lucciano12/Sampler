import { Component, OnInit } from '@angular/core'; // Importamos los decoradores Component y OnInit de Angular
import { SamplerService, Sampler } from '../../services/sampler'; // Importamos el servicio Sampler y la interfaz Sampler
import { NgIf, NgFor } from '@angular/common'; // Importamos NgIf y NgFor para usar en la plantilla

@Component({
  selector: 'app-lista-samplers',
  standalone: true, // Indicamos que este componente es independiente
  imports: [NgIf, NgFor], // Importamos NgIf y NgFor para usar en la plantilla
  templateUrl: './lista-samplers.html',
  styleUrl: './lista-samplers.scss'
})
export class ListaSamplers implements OnInit{ //El OnInit es un ciclo de vida de Angular que se ejecuta una vez que el componente ha sido inicializado
  samplers: Sampler[] = []; //Inicializamos un array de samplers

  constructor(private samplerService: SamplerService) { } //Inyectamos el servicio Sampler en el constructor

  ngOnInit() { //Método que se ejecuta al inicializar el componente
    this.samplerService.getSampler().subscribe((data: Sampler[]) => { //Llamamos al método getSampler del servicio y nos suscribimos al Observable
      this.samplers = data; //Asignamos los datos obtenidos al array de samplers
    });
  } //Fin del método ngOnInit
}
