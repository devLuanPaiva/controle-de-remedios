import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthTokenService } from './auth-token.service';

interface TokenKindFixture {
  label: string;
  storageKey: string;
  set: (service: AuthTokenService, value: string) => void;
  get: (service: AuthTokenService) => string | null;
}

const tokenKinds: TokenKindFixture[] = [
  {
    label: 'access token',
    storageKey: 'access_token',
    set: (service, value) => service.setAccessToken(value),
    get: (service) => service.getAccessToken(),
  },
  {
    label: 'refresh token',
    storageKey: 'refresh_token',
    set: (service, value) => service.setRefreshToken(value),
    get: (service) => service.getRefreshToken(),
  },
];

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTokenService);
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe.each(tokenKinds)('$label storage', ({ label, storageKey, set, get }) => {
    it(`should persist the ${label} under its sessionStorage key`, () => {
      set(service, 'token-value-123');

      expect(sessionStorage.getItem(storageKey)).toBe('token-value-123');
    });

    it(`should return the stored ${label} when it exists`, () => {
      sessionStorage.setItem(storageKey, 'existing-value');

      const result = get(service);

      expect(result).toBe('existing-value');
    });

    it(`should return an empty string, not null, when the ${label} was explicitly stored as empty`, () => {
      sessionStorage.setItem(storageKey, '');

      const result = get(service);

      expect(result).toBe('');
    });

    it(`should return null when no ${label} is stored`, () => {
      const result = get(service);

      expect(result).toBeNull();
    });

    it(`should not throw when setting the ${label} and sessionStorage is unavailable`, () => {
      vi.stubGlobal('sessionStorage', undefined);

      expect(() => set(service, 'any-value')).not.toThrow();
    });

    it(`should return null when reading the ${label} and sessionStorage is unavailable`, () => {
      vi.stubGlobal('sessionStorage', undefined);

      const result = get(service);

      expect(result).toBeNull();
    });

    it(`should silently swallow the error when sessionStorage.setItem throws while storing the ${label}`, () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => set(service, 'any-value')).not.toThrow();
    });

    it(`should return null when sessionStorage.getItem throws while reading the ${label}`, () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const result = get(service);

      expect(result).toBeNull();
    });
  });

  it('should store the access token and the refresh token independently under different keys', () => {
    service.setAccessToken('access-value');
    service.setRefreshToken('refresh-value');

    expect(service.getAccessToken()).toBe('access-value');
    expect(service.getRefreshToken()).toBe('refresh-value');
  });

  describe('clearTokens', () => {
    it('should remove both the access token and the refresh token from sessionStorage', () => {
      sessionStorage.setItem('access_token', 'access-value');
      sessionStorage.setItem('refresh_token', 'refresh-value');

      service.clearTokens();

      expect(sessionStorage.getItem('access_token')).toBeNull();
      expect(sessionStorage.getItem('refresh_token')).toBeNull();
    });

    it('should not remove unrelated keys from sessionStorage', () => {
      sessionStorage.setItem('access_token', 'access-value');
      sessionStorage.setItem('unrelated_key', 'keep-me');

      service.clearTokens();

      expect(sessionStorage.getItem('unrelated_key')).toBe('keep-me');
    });

    it('should not throw when sessionStorage is unavailable', () => {
      vi.stubGlobal('sessionStorage', undefined);

      expect(() => service.clearTokens()).not.toThrow();
    });

    it('should silently swallow the error when sessionStorage.removeItem throws', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => service.clearTokens()).not.toThrow();
    });
  });
});
