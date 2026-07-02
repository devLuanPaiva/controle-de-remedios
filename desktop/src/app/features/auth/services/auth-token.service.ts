import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';

  setAccessToken(token: string): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(this.ACCESS_KEY, token);
    } catch {
      // ignore storage errors (e.g., SSR or private mode)
    }
  }

  getAccessToken(): string | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      return sessionStorage.getItem(this.ACCESS_KEY);
    } catch {
      return null;
    }
  }

  setRefreshToken(token: string): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(this.REFRESH_KEY, token);
    } catch {
      // ignore
    }
  }

  getRefreshToken(): string | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      return sessionStorage.getItem(this.REFRESH_KEY);
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.removeItem(this.ACCESS_KEY);
      sessionStorage.removeItem(this.REFRESH_KEY);
    } catch {
      // ignore
    }
  }
}

