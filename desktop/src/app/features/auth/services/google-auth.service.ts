import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { defer, firstValueFrom, from, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { decodeJwtPayload } from '@shared/utils/jwt.util';
import { generateCodeChallenge, generateRandomToken } from '@shared/utils/pkce.util';

import { AuthResponse } from '../models/auth-response.model';
import { AuthUser } from '../models/auth-user.model';
import { AuthSessionService } from './auth-session.service';

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_SCOPE = 'openid email profile';
const STATE_BYTE_LENGTH = 16;
const CODE_VERIFIER_BYTE_LENGTH = 32;

interface GoogleOAuthCallback {
    code: string | null;
    state: string | null;
    error: string | null;
}

export class GoogleSignInCancelledError extends Error {
    constructor() {
        super('Login com Google cancelado.');
        this.name = 'GoogleSignInCancelledError';
    }
}


@Injectable({
    providedIn: 'root',
})
export class GoogleAuthService {
    private readonly http = inject(HttpClient);
    private readonly session = inject(AuthSessionService);

    apiUrl = signal(environment.api_url);

    login(): Observable<AuthResponse> {
        return defer(() => from(this.runLoginFlow()));
    }

    private async runLoginFlow(): Promise<AuthResponse> {
        const port = await invoke<number>('google_oauth_start_listener');
        const redirectUri = `http://127.0.0.1:${port}`;

        const state = generateRandomToken(STATE_BYTE_LENGTH);
        const codeVerifier = generateRandomToken(CODE_VERIFIER_BYTE_LENGTH);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        await openUrl(this.buildAuthorizationUrl(redirectUri, state, codeChallenge));

        const callback = await invoke<GoogleOAuthCallback>('google_oauth_wait_for_callback');

        this.assertSuccessfulCallback(callback, state);

        const response = await firstValueFrom(
            this.http.post<AuthResponse>(`${this.apiUrl()}/auth/google/desktop`, {
                code: callback.code,
                codeVerifier,
                redirectUri,
            }),
        );

        const user = this.decodeUser(response.accessToken);
        this.session.setSession(user, response.accessToken, response.refreshToken);

        return { ...response, user } as AuthResponse;
    }

    private assertSuccessfulCallback(callback: GoogleOAuthCallback, expectedState: string): void {
        if (callback.error) {
            throw new GoogleSignInCancelledError();
        }

        if (!callback.code || callback.state !== expectedState) {
            throw new Error('Não foi possível validar o retorno do Google.');
        }
    }

    private buildAuthorizationUrl(redirectUri: string, state: string, codeChallenge: string): string {
        const params = new URLSearchParams({
            client_id: environment.googleOAuthClientIdDesktop,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: GOOGLE_OAUTH_SCOPE,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            state,
            prompt: 'select_account',
        });

        return `${GOOGLE_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
    }

    private decodeUser(accessToken: string): AuthUser | null {
        const parsed = decodeJwtPayload(accessToken);

        if (parsed && typeof parsed.sub === 'string' && typeof parsed.name === 'string' && typeof parsed.email === 'string' && typeof parsed.role === 'string') {
            const imageUrl = typeof parsed.imageUrl === 'string' ? parsed.imageUrl : '';
            return { id: parsed.sub, name: parsed.name, email: parsed.email, role: parsed.role, imageUrl };
        }

        return null;
    }
}
