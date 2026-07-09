import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthTokenService } from './auth-token.service';
import { Router } from '@angular/router';
import { AuthUser } from '../models/auth-user.model';
import { decodeJwtPayload } from '@shared/utils/jwt.util';


@Injectable({
    providedIn: 'root',
})
export class AuthSessionService {
    private readonly tokenService = inject(AuthTokenService);

    private readonly router = inject(Router);

    private readonly userSignal = signal<AuthUser | null>(null);

    readonly user = this.userSignal.asReadonly();

    readonly authenticated = computed(() => !!this.user());

    constructor() {
        this.hydrateSession();
    }

    setSession(user: AuthUser | null, token?: string, refreshToken?: string): void {

        if (token) {
            this.tokenService.setAccessToken(token);
        }
        if (refreshToken) {
            this.tokenService.setRefreshToken(refreshToken);
        }

        if (user) {
            this.userSignal.set(user);
            return;
        }

        if (token) {
            const decodedUser = this.decodeJwtUser(token);
            if (decodedUser) {
                this.userSignal.set(decodedUser);
                return;
            }
        }

        if (user === null && !token && !refreshToken) {
            this.userSignal.set(null);
        }
    }

    getRefreshToken() {
        return this.tokenService
            .getRefreshToken();
    }

    clearSession(): void {
        this.tokenService.clearTokens();
        this.userSignal.set(null);
    }

    logout() {
        this.clearSession();
        this.router.navigate(['/login']);
    }

    hydrateSession() {
        const token = this.tokenService.getAccessToken();

        if (!token) {
            return;
        }

        const user = this.decodeJwtUser(token);
        if (user) {
            this.userSignal.set(user);
        }
    }

    private decodeJwtUser(token: string): AuthUser | null {
        const parsed = decodeJwtPayload(token);
        if (!parsed) return null;
        if (typeof parsed.sub === 'string' && typeof parsed.name === 'string' && typeof parsed.email === 'string' && typeof parsed.role === 'string') {
            const imageUrl = typeof parsed.imageUrl === 'string' ? parsed.imageUrl : '';
            return { id: parsed.sub, name: parsed.name, email: parsed.email, role: parsed.role, imageUrl };
        }
        return null;
    }
}
