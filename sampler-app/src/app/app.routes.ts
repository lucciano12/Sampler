import { Routes } from '@angular/router';
import {
  requiresAccessGuard,
  requiresAuthGuard,
  redirectIfLoggedInGuard
} from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent),
    canActivate: [redirectIfLoggedInGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [redirectIfLoggedInGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [redirectIfLoggedInGuard]
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./components/lista-samplers/lista-samplers').then(m => m.ListaSamplers),
    canActivate: [requiresAccessGuard]
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./favoritos/favoritos.component').then(m => m.FavoritosComponent),
    canActivate: [requiresAuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
