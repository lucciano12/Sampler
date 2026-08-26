import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

// Imagen de reemplazo cuando la portada original falla
const FALLBACK = 'https://placehold.co/400x400?text=No+Cover';

/**
 * Lazy loading visual de portadas.
 * La imagen arranca invisible (.img-cargando) y hace fade-in (.img-cargada)
 * cuando termina de cargar o falla. El shimmer del contenedor lo maneja el SCSS.
 */
@Directive({
  selector: 'img[lazyImg]',
  standalone: true,
})
export class LazyImgDirective {
  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {
    // Estado inicial: invisible hasta que cargue
    this.renderer.addClass(this.el.nativeElement, 'img-cargando');
  }

  @HostListener('load')
  onLoad(): void {
    this.marcarCargada();
  }

  @HostListener('error')
  onError(): void {
    this.marcarCargada();

    const img = this.el.nativeElement;
    // Guard: si el placeholder tambien falla, no reasignamos (evita bucle de requests)
    if (img.src !== FALLBACK) {
      img.src = FALLBACK;
    }
  }

  /** Saca el estado de carga y dispara el fade-in */
  private marcarCargada(): void {
    this.renderer.removeClass(this.el.nativeElement, 'img-cargando');
    this.renderer.addClass(this.el.nativeElement, 'img-cargada');
  }
}
