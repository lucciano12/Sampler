import { Component, OnInit, inject } from '@angular/core'; // Importamos los decoradores Component y OnInit de Angular
import { SamplerService, Sampler } from '../../services/sampler'; // Importamos el servicio Sampler y la interfaz Sampler
import { FavoritosService } from '../../services/favoritos.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { debounceTime, filter } from 'rxjs';
import { Offcanvas } from 'bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  //Quiere decir que esta clase es un componente de Angular
  selector: 'app-lista-samplers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './lista-samplers.html',
  styleUrl: './lista-samplers.scss',
})
export class ListaSamplers implements OnInit {
  //El OnInit es un ciclo de vida de Angular que se ejecuta una vez que el componente ha sido inicializado
  samplers: Sampler[] = []; //Inicializamos un array de samplers
  filtered: Sampler[] = []; //Inicializamos un array de samplers filtrados
  bpmCalculado: number | null = null; //Inicializamos una variable para el BPM calculado, que puede ser un número o null
  private taps: number[] = []; //Inicializamos un array para almacenar los tiempos de los taps del usuario

  //controles de busqueda local y búsqueda por estilo en Discogs
  q = new FormControl<string>('', { nonNullable: true });
  estiloCtrl = new FormControl<string>('Funk', { nonNullable: true });

  loading = false; //Indicador de carga
  errorMsg = ''; //Mensaje de error

  // Zoom Modal
  zoomModalOpen = false;
  zoomImage: string | null = null;
  zoomTitle: string | null = null;

  openZoomModal(imagen: string | undefined | null, titulo: string): void {
    this.zoomImage = imagen || null;
    this.zoomTitle = titulo;
    this.zoomModalOpen = true;
  }

  closeZoomModal(): void {
    this.zoomModalOpen = false;
    this.zoomImage = null;
    this.zoomTitle = null;
  }

  closeZoomOnBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeZoomModal();
    }
  }

  // Servicio de favoritos (signal-based, persiste en localStorage)
  readonly favoritosService = inject(FavoritosService);

  // Vista actual: catálogo (búsqueda por API) o favoritos (localStorage)
  vistaActual: 'catalogo' | 'favoritos' = 'catalogo';

  constructor(
    private samplerService: SamplerService,
    private sanitizer: DomSanitizer,
  ) {} //Inyectamos el servicio Sampler y DomSanitizer en el constructor

  ngOnInit() {
    // Debounce de 600ms + mínimo 3 caracteres para no saturar la API de Discogs (rate limit 429)
    this.q.valueChanges
      .pipe(
        debounceTime(600),
        filter(term => term.trim().length === 0 || term.trim().length >= 3),
      )
      .subscribe(() => this.buscar());
    this.buscar();
  }

  private applyFilters() {
    const term = normalize(this.q.value);
    if (!term) {
      this.filtered = this.samplers;
      return;
    }
    this.filtered = this.samplers
      .map((s) => ({ s, score: scoreSampler(s, term) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
  }

  sampleSel: Sampler | null = null;

  buscar(): void {
    const estilo = this.estiloCtrl.value.trim() || 'Funk';
    // Si hay texto en q, se envía como query para combinar con el estilo en Discogs
    const query = this.q.value.trim() || undefined;
    this.loading = true;
    this.errorMsg = '';
    this.samplerService.buscarPorEstilo(estilo, query).subscribe({
      next: (samplers) => {
        this.samplers = samplers;
        // applyFilters() como filtro adicional con scoring local sobre los resultados de la API
        this.applyFilters();
        this.loading = false;
      },
      error: (e) => {
        this.errorMsg = 'No se pudieron cargar resultados de Discogs';
        this.loading = false;
        console.error(e);
      },
    });
  }

  getYoutubeSearchUrl(s: Sampler | null): SafeResourceUrl | null {
    if (!s) return null;
    const q = encodeURIComponent(s.artista + ' ' + s.titulo);
    const url = `https://www.youtube.com/embed?listType=search&list=${q}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  abrirDetalle(s: Sampler) {
    this.sampleSel = s;
    const el = document.getElementById('offcanvasDetalle');
    if (!el) return;
    const panel = Offcanvas.getOrCreateInstance(el);
    panel.show();
  }

  registrarTap(): void {
    this.taps.push(Date.now());
    if (this.taps.length > 8) this.taps.shift(); // Mantenemos solo los últimos 8 taps para calcular el BPM
    if (this.taps.length < 2) return;

    const intervalos = this.taps.slice(1).map((t, i) => t - this.taps[i]);

    const promedioMs =
      intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
    this.bpmCalculado = Math.round(60000 / promedioMs);
  }

  resetTap(): void {
    this.taps = [];
    this.bpmCalculado = null;
  }

  // ─── Favoritos ───────────────────────────────────────────────────

  /** Alterna el estado de favorito de un sampler. Usa stopPropagation para no disparar el offcanvas. */
  toggleFavorito(event: Event, sampler: Sampler): void {
    event.stopPropagation();
    this.favoritosService.toggleFavorito(sampler);
  }

  /** Consulta si un sampler está en favoritos */
  esFavorito(sampler: Sampler): boolean {
    return this.favoritosService.esFavorito(sampler);
  }

  /** Cambia entre la vista de catálogo y la de favoritos */
  cambiarVista(vista: 'catalogo' | 'favoritos'): void {
    this.vistaActual = vista;
  }

  /** Elimina todos los favoritos con confirmación del usuario */
  limpiarFavoritos(): void {
    if (confirm('¿Eliminar todos los favoritos?')) {
      this.favoritosService.limpiarFavoritos();
    }
  }
}

//Función para normalizar un texto (quitar tildes y pasar a minúsculas)
function normalize(v: string | undefined | null): string {
  return (v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .trim();
}

/** Sencillo scoring por relevancia: título (3x), artista (2x), descripción/fuente (1x) */
function scoreSampler(s: Sampler, term: string): number {
  const titulo = normalize(s.titulo);
  const artista = normalize(s.artista);
  const fuente = normalize(s.fuente);
  const desc = normalize(s.descripcion);

  let score = 0;
  if (titulo.includes(term)) score += 3;
  if (artista.includes(term)) score += 2;
  if (fuente.includes(term)) score += 1;
  if (desc.includes(term)) score += 1;
  return score;
}
