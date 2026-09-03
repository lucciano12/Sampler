import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const requiresAccessGuard: CanActivateFn = () => { //Requiere acceso 
  //Inyecta el servicio de autenticación y el enrutador
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.hasAccess()) return true; //si el usuario tiene acceso, se le permite continuar
  return router.createUrlTree(['/']);
};

export const requiresAuthGuard: CanActivateFn = () => { //Requiere autenticación
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true; //si el usuario esta autenticado, se le permite continuar
  return router.createUrlTree(['/catalogo']);
};

export const redirectIfLoggedInGuard: CanActivateFn = () => { //Redirige si el usuario esta logeado
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.hasAccess()) return router.createUrlTree(['/catalogo']); //si el usuario tiene acceso, se le redirige al catalogo
  return true;
};
