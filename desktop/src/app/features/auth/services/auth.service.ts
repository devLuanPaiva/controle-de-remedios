import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { AuthSessionService } from './auth-session.service';
import { AuthUser } from '../models/auth-user.model';
import { decodeJwtPayload } from '@shared/utils/jwt.util';
import { map } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  apiUrl = signal(environment.api_url)

  private readonly session = inject(AuthSessionService);

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(
      `${this.apiUrl()}/auth/login`,
      payload
    ).pipe(
      map(response => {
        const parsed = decodeJwtPayload(response.accessToken);
        let user: AuthUser | null = null;
        if (parsed && typeof parsed.sub === 'string' && typeof parsed.name === 'string' && typeof parsed.email === 'string' && typeof parsed.role === 'string') {
          user = { id: parsed.sub, name: parsed.name, email: parsed.email, role: parsed.role };
          this.session.setSession(user, response.accessToken, response.refreshToken);
        } else {
          this.session.setSession(null, response.accessToken, response.refreshToken);
        }

        return {
          ...response,
          user
        } as AuthResponse;
      })
    )
  }

  logout() {
    this.session.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.session.user();
  }


  sessionRefreshToken() {
    return this.session.getRefreshToken();
  }

  refreshToken() {
    const refreshToken =
      this.sessionRefreshToken();

    return this.http.post<AuthResponse>(
      `${this.apiUrl()}/auth/refresh`,
      {
        refreshToken
      }
    );
  }

  getRefreshToken() {
    return this.session
      .getRefreshToken();
  }

}
