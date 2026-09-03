import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type UserRole = 'authenticated' | 'guest' | null; 
//Se define los tipos de usuario que 
// pueden existir en la aplicación: 'authenticated' para usuarios autenticados, 
// 'guest' para usuarios invitados y null para usuarios no autenticados.

export interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
 
  //Se define las claves de almacenamiento local para el token, el rol y el usuario
  private readonly TOKEN_KEY = 'sampler_token';
  private readonly ROLE_KEY  = 'sampler_role';
  private readonly USER_KEY  = 'sampler_user';

  //Se definen las señales para el rol, el usuario y el token
  private _role  = signal<UserRole>(this.readRoleFromStorage());
  private _user  = signal<User | null>(this.readUserFromStorage());
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  //Se definen las señales de solo lectura para el rol y el usuario
  readonly role = this._role.asReadonly();
  readonly user = this._user.asReadonly();

  //Se define las señales computadas para determinar si el usuario esta autenticado
  // si es invitado, si tiene acceso y si puede usar funciones premium
  readonly isAuthenticated = computed(() => this._role() === 'authenticated');
  readonly isGuest         = computed(() => this._role() === 'guest');
  readonly hasAccess       = computed(() => this._role() !== null);
  readonly canUsePremium   = computed(() => this._role() === 'authenticated');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  continueAsGuest(): void { // continua como invitado
    this._role.set('guest');
    localStorage.setItem(this.ROLE_KEY, 'guest');
    this.router.navigate(['/catalogo']);
  }

  login(email: string, password: string) { //Logear
    return this.http
      .post<{ token: string; user: User }>(
        `${environment.apiUrl}/auth/login`,
        { email, password }
      )
      .pipe(
        tap(({ token, user }) => {
          this._token.set(token);
          this._user.set(user);
          this._role.set('authenticated');

          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.ROLE_KEY, 'authenticated');
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        })
      );
  }

  register(name: string, email: string, password: string) { //registrar
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/register`,
      { name, email, password }
    );
  }

  logout(): void { //Cerrar sesión
    this._role.set(null);
    this._user.set(null);
    this._token.set(null);

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.router.navigate(['/']);
  }

  getToken(): string | null { //Obtener token
    return this._token();
  }

  private readRoleFromStorage(): UserRole { //Leer rol desde almacenamiento local
    const role = localStorage.getItem(this.ROLE_KEY);
    if (role === 'authenticated' || role === 'guest') return role;
    return null;
  }

  private readUserFromStorage(): User | null { //Leer usuario desde almacenamiento local
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
