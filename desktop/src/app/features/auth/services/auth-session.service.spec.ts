import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, vi } from 'vitest';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthUser } from '../models/auth-user.model';
import { UserRole } from '@features/users/models/user.model';
import { buildJwtToken as buildToken } from '@shared/utils/testing/jwt-token.fixture';

const mockUser: AuthUser = {
  id: 'user-1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  imageUrl: 'https://example.com/avatar.png',
  role: UserRole.ASSISTANT,
};


const validJwtClaims = {
  sub: 'user-42',
  name: 'Carlos Pereira',
  email: 'carlos@example.com',
  role: 'ADMIN',
  imageUrl: 'https://example.com/carlos.png',
};

const expectedUserFromToken = {
  id: 'user-42',
  name: 'Carlos Pereira',
  email: 'carlos@example.com',
  role: 'ADMIN',
  imageUrl: 'https://example.com/carlos.png',
};

interface AuthTokenServiceMock {
  getAccessToken: ReturnType<typeof vi.fn>;
  getRefreshToken: ReturnType<typeof vi.fn>;
  setAccessToken: ReturnType<typeof vi.fn>;
  setRefreshToken: ReturnType<typeof vi.fn>;
  clearTokens: ReturnType<typeof vi.fn>;
}

function createTokenServiceMock(accessTokenAtStartup: string | null = null): AuthTokenServiceMock {
  return {
    getAccessToken: vi.fn().mockReturnValue(accessTokenAtStartup),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };
}

function setup(accessTokenAtStartup: string | null = null) {
  const tokenService = createTokenServiceMock(accessTokenAtStartup);
  const navigate = vi.fn().mockResolvedValue(true);

  TestBed.configureTestingModule({
    providers: [
      { provide: AuthTokenService, useValue: tokenService as unknown as AuthTokenService },
      { provide: Router, useValue: { navigate } as unknown as Router },
    ],
  });

  const service = TestBed.inject(AuthSessionService);
  return { service, tokenService, navigate };
}

describe('AuthSessionService', () => {
  describe('hydration on construction', () => {
    it('should hydrate the user signal from a valid access token present at startup', () => {
      const { service } = setup(buildToken(validJwtClaims));

      expect(service.user()).toEqual(expectedUserFromToken);
    });

    it('should leave the user signal as null when there is no access token at startup', () => {
      const { service } = setup(null);

      expect(service.user()).toBeNull();
    });

    it('should leave the user signal as null when the access token at startup is malformed', () => {
      const { service } = setup('not-a-jwt');

      expect(service.user()).toBeNull();
    });

    it('should leave the user signal as null when the access token claims at startup are incomplete', () => {
      const { email: _email, ...incompleteClaims } = validJwtClaims;

      const { service } = setup(buildToken(incompleteClaims));

      expect(service.user()).toBeNull();
    });

    it('should leave the user signal as null when the role claim is numeric instead of a string (matches the real UserRole enum shape)', () => {
      const claimsWithNumericRole = { ...validJwtClaims, role: UserRole.ADMIN };

      const { service } = setup(buildToken(claimsWithNumericRole));

      expect(service.user()).toBeNull();
    });
  });

  describe('hydrateSession', () => {
    it('should update the user signal when called again after the stored token changes', () => {
      const { service, tokenService } = setup(null);
      expect(service.user()).toBeNull();

      tokenService.getAccessToken.mockReturnValue(buildToken(validJwtClaims));
      service.hydrateSession();

      expect(service.user()).toEqual(expectedUserFromToken);
    });

    it('should leave the user signal unchanged when called again but the token has been removed', () => {
      const { service, tokenService } = setup(buildToken(validJwtClaims));
      expect(service.user()).toEqual(expectedUserFromToken);

      tokenService.getAccessToken.mockReturnValue(null);
      service.hydrateSession();

      expect(service.user()).toEqual(expectedUserFromToken);
    });
  });

  describe('setSession', () => {
    it('should set the user signal and persist both tokens when a user object is provided', () => {
      const { service, tokenService } = setup();

      service.setSession(mockUser, 'access-tok', 'refresh-tok');

      expect(tokenService.setAccessToken).toHaveBeenCalledWith('access-tok');
      expect(tokenService.setRefreshToken).toHaveBeenCalledWith('refresh-tok');
      expect(service.user()).toEqual(mockUser);
    });

    it('should decode the user from the access token when no user object is provided but the token has valid claims', () => {
      const { service, tokenService } = setup();

      service.setSession(null, buildToken(validJwtClaims));

      expect(tokenService.setAccessToken).toHaveBeenCalledWith(buildToken(validJwtClaims));
      expect(service.user()).toEqual(expectedUserFromToken);
    });

    it('should not persist the access token when an empty string is provided', () => {
      const { service, tokenService } = setup();

      service.setSession(mockUser, '', 'refresh-tok');

      expect(tokenService.setAccessToken).not.toHaveBeenCalled();
      expect(tokenService.setRefreshToken).toHaveBeenCalledWith('refresh-tok');
    });

    it('should persist only the refresh token and leave the user signal untouched when only a refresh token is provided', () => {
      const { service, tokenService } = setup();
      service.setSession(mockUser);
      expect(service.user()).toEqual(mockUser);

      service.setSession(null, undefined, 'only-refresh-tok');

      expect(tokenService.setAccessToken).not.toHaveBeenCalled();
      expect(tokenService.setRefreshToken).toHaveBeenCalledWith('only-refresh-tok');
      expect(service.user()).toEqual(mockUser);
    });

    it('should keep the stale user object from a previous session when no user is given and the new token has incomplete claims', () => {
      const { service } = setup();
      service.setSession(mockUser);
      expect(service.user()).toEqual(mockUser);

      const { email: _email, ...incompleteClaims } = validJwtClaims;
      service.setSession(null, buildToken(incompleteClaims));

      expect(service.user()).toEqual(mockUser);
    });

    it('should clear the user signal when called with no user, no token and no refresh token', () => {
      const { service } = setup();
      service.setSession(mockUser);
      expect(service.user()).toEqual(mockUser);

      service.setSession(null);

      expect(service.user()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should delegate to the token service and return the stored refresh token', () => {
      const { service, tokenService } = setup();
      tokenService.getRefreshToken.mockReturnValue('stored-refresh-token');

      const result = service.getRefreshToken();

      expect(result).toBe('stored-refresh-token');
    });

    it('should return null when there is no refresh token', () => {
      const { service } = setup();

      const result = service.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear stored tokens and reset the user signal to null', () => {
      const { service, tokenService } = setup();
      service.setSession(mockUser);

      service.clearSession();

      expect(tokenService.clearTokens).toHaveBeenCalled();
      expect(service.user()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear the session and navigate to the login page', () => {
      const { service, tokenService, navigate } = setup();
      service.setSession(mockUser);

      service.logout();

      expect(tokenService.clearTokens).toHaveBeenCalled();
      expect(service.user()).toBeNull();
      expect(navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('authenticated', () => {
    it('should be true when a user is present', () => {
      const { service } = setup();
      service.setSession(mockUser);

      expect(service.authenticated()).toBe(true);
    });

    it('should be false when there is no user', () => {
      const { service } = setup();

      expect(service.authenticated()).toBe(false);
    });
  });
});
