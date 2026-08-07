import { Injectable, signal, computed } from '@angular/core';
import { Sampler } from './sampler';

const STORAGE_KEY = 'sampler_favoritos';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  /** Signal privado inicializado desde localStorage */
  private _favoritos = signal<Sampler[]>(this.cargarDesdeStorage());

  /** Signal público de solo lectura */
  readonly favoritos = this._favoritos.asReadonly();

  /** Computed: cantidad total de favoritos */
  readonly totalFavoritos = computed(() => this._favoritos().length);

  /**
   * Genera un ID único para cada sampler.
   * Usa el enlace si existe, sino el combo título-artista normalizado.
   */
  idUnico(s: Sampler): string {
    if (s.enlace) return s.enlace;
    return `${s.titulo}-${s.artista}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/\s+/g, '-');
  }

  /** Verifica si un sampler está en favoritos */
  esFavorito(sampler: Sampler): boolean {
    const id = this.idUnico(sampler);
    return this._favoritos().some(f => this.idUnico(f) === id);
  }

  /** Alterna el estado de favorito: lo agrega si no está, lo quita si ya estaba */
  toggleFavorito(sampler: Sampler): void {
    const id = this.idUnico(sampler);
    const idx = this._favoritos().findIndex(f => this.idUnico(f) === id);

    if (idx >= 0) {
      this._favoritos.update(lista => lista.filter((_, i) => i !== idx));
    } else {
      this._favoritos.update(lista => [...lista, sampler]);
    }

    this.persistir();
  }

  /** Elimina todos los favoritos */
  limpiarFavoritos(): void {
    this._favoritos.set([]);
    this.persistir();
  }

  // ─── Persistencia en localStorage ────────────────────────────────

  private cargarDesdeStorage(): Sampler[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Sampler[]) : [];
    } catch {
      return [];
    }
  }

  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._favoritos()));
  }
}
