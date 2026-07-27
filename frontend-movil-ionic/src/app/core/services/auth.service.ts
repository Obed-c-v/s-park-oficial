import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'spark_auth_token';
  
  public isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setToken(res.token);
          if (res.user) {
            const userActivo = {
              ...res.user,
              id: res.user.paciente_id || res.user.id
            };
            localStorage.setItem('usuarioActivo', JSON.stringify(userActivo));
          }
        }
      })
    );
  }

  verifyCode(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-code`, { email, codigo });
  }

  changeInitialPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-initial-password`, { email, newPassword }).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setToken(res.token);
          if (res.user) {
            const userActivo = {
              ...res.user,
              id: res.user.paciente_id || res.user.id
            };
            localStorage.setItem('usuarioActivo', JSON.stringify(userActivo));
          }
        }
      })
    );
  }

  resendCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-code`, { email });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`).pipe(
      tap((res: any) => {
        if (res.details) {
          const userActivo = {
            id: res.details.id,
            email: res.details.email,
            rol: res.rol,
            medico_id: res.details.medico_id,
            nombre: res.details.nombre,
            apellido: res.details.apellido
          };
          localStorage.setItem('usuarioActivo', JSON.stringify(userActivo));
        }
      })
    );
  }

  getMedicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medicos`);
  }

  getCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/citas`);
  }

  createCita(medicoId: number, fechaHora: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, { medico_id: medicoId, fecha_hora: fechaHora });
  }

  /**
   * Actualiza el perfil del usuario activo (nombre, apellido, telefono, alergias, recetas).
   * El backend detecta el rol por el JWT y guarda en la tabla correcta.
   */
  updateProfile(_userId: any, _rol: string, _medicoId: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/me`, data);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated$.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('usuarioActivo');
    localStorage.removeItem('sesionActiva');
    this.isAuthenticated$.next(false);
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
