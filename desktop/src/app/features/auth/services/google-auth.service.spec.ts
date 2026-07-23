import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';

import { environment } from '@environments/environment';
import { buildJwtToken } from '@shared/utils/testing/jwt-token.fixture';

import { GoogleAuthService, GoogleSignInCancelledError } from './google-auth.service';
import { AuthSessionService } from './auth-session.service';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);
const mockedOpenUrl = vi.mocked(openUrl);

const validJwtClaims = {
  sub: 'user-42',
  name: 'Carlos Pereira',
  email: 'carlos@example.com',
  role: 'ADMIN',
  imageUrl: 'https://example.com/carlos.png',
};

function stateFromOpenedUrl(): string {
  const [openedUrl] = mockedOpenUrl.mock.calls[0];
  return new URL(openedUrl as string).searchParams.get('state') ?? '';
}

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let httpMock: HttpTestingController;
  let session: AuthSessionService;

  beforeEach(() => {
    mockedInvoke.mockReset();
    mockedOpenUrl.mockReset();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GoogleAuthService],
    });

    service = TestBed.inject(GoogleAuthService);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSessionService);

    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts a loopback listener, opens the consent screen with a PKCE challenge, and exchanges the code returned by Google', async () => {
    mockedInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'google_oauth_start_listener') return 51823;
      if (cmd === 'google_oauth_wait_for_callback') {
        return { code: 'auth-code', state: stateFromOpenedUrl(), error: null };
      }
      throw new Error(`unexpected command: ${cmd}`);
    });

    let result: { accessToken: string; refreshToken: string } | undefined;
    service.login().subscribe((response) => (result = response));

    await vi.waitFor(() => expect(mockedOpenUrl).toHaveBeenCalled());

    const [openedUrl] = mockedOpenUrl.mock.calls[0];
    const authorizationUrl = new URL(openedUrl as string);
    expect(authorizationUrl.origin + authorizationUrl.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authorizationUrl.searchParams.get('client_id')).toBe(environment.googleOAuthClientIdDesktop);
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:51823');
    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();

    const req = await vi.waitFor(() => httpMock.expectOne(`${environment.api_url}/auth/google/desktop`));
    expect(req.request.body.code).toBe('auth-code');
    expect(req.request.body.redirectUri).toBe('http://127.0.0.1:51823');
    expect(typeof req.request.body.codeVerifier).toBe('string');

    req.flush({ accessToken: buildJwtToken(validJwtClaims), refreshToken: 'refresh-token' });

    await vi.waitFor(() => expect(result).toBeDefined());
    expect(result?.refreshToken).toBe('refresh-token');
    expect(session.user()).toEqual({
      id: 'user-42',
      name: 'Carlos Pereira',
      email: 'carlos@example.com',
      role: 'ADMIN',
      imageUrl: 'https://example.com/carlos.png',
    });
  });

  it('throws GoogleSignInCancelledError when Google reports an error (e.g. the user denies consent)', async () => {
    mockedInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'google_oauth_start_listener') return 51823;
      if (cmd === 'google_oauth_wait_for_callback') {
        return { code: null, state: null, error: 'access_denied' };
      }
      throw new Error(`unexpected command: ${cmd}`);
    });

    let error: unknown;
    service.login().subscribe({ error: (err) => (error = err) });

    await vi.waitFor(() => expect(error).toBeDefined());
    expect(error).toBeInstanceOf(GoogleSignInCancelledError);
  });

  it('rejects the callback when its state does not match the one that was sent (CSRF protection)', async () => {
    mockedInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'google_oauth_start_listener') return 51823;
      if (cmd === 'google_oauth_wait_for_callback') {
        return { code: 'auth-code', state: 'tampered-state', error: null };
      }
      throw new Error(`unexpected command: ${cmd}`);
    });

    let error: unknown;
    service.login().subscribe({ error: (err) => (error = err) });

    await vi.waitFor(() => expect(error).toBeDefined());
    expect(error).not.toBeInstanceOf(GoogleSignInCancelledError);
    expect((error as Error).message).toBe('Não foi possível validar o retorno do Google.');
  });

  it('propagates the API error (e.g. e-mail not registered) without touching the session', async () => {
    mockedInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'google_oauth_start_listener') return 51823;
      if (cmd === 'google_oauth_wait_for_callback') {
        return { code: 'auth-code', state: stateFromOpenedUrl(), error: null };
      }
      throw new Error(`unexpected command: ${cmd}`);
    });

    let error: unknown;
    service.login().subscribe({ error: (err) => (error = err) });

    const req = await vi.waitFor(() => httpMock.expectOne(`${environment.api_url}/auth/google/desktop`));
    req.flush(
      {
        status: 'error',
        message: 'Acesso não autorizado',
        data: null,
        errors: [{ code: 'AUTH_EMAIL_NOT_REGISTERED', field: 'email', detail: 'E-mail não cadastrado.' }],
      },
      { status: 403, statusText: 'Forbidden' },
    );

    await vi.waitFor(() => expect(error).toBeDefined());
    expect(session.user()).toBeNull();
  });
});
