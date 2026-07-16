import { describe, it, expect, afterEach, vi } from 'vitest';
import { decodeJwtPayload } from './jwt.util';
import { UserRole } from '@features/users/models/user.model';
import { encodeUtf8ToBase64Url, buildJwtToken as buildToken } from './testing/jwt-token.fixture';

describe('decodeJwtPayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should decode a valid JWT and return all expected claims', () => {
    const payload = {
      sub: 'user-123',
      name: 'Maria Silva',
      email: 'maria@example.com',
      role: UserRole.ADMIN,
      imageUrl: 'https://example.com/avatar.png',
      iat: 1710000000,
      exp: 1710003600,
    };
    const token = buildToken(payload);

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('should correctly decode unicode/accented characters in the payload', () => {
    const payload = { sub: 'user-456', name: 'José da Conceição Ánanás 日本語' };
    const token = buildToken(payload);

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('should return null when the token is an empty string', () => {
    const result = decodeJwtPayload('');

    expect(result).toBeNull();
  });

  it.each([
    ['string without any separator dots', 'tokensemponto'],
    ['conceptually empty after trim but not literally empty', ' '],
  ])('should return null when the token is invalid: %s', (_description, invalidToken) => {
    const result = decodeJwtPayload(invalidToken);

    expect(result).toBeNull();
  });

  it('should return null when the payload segment is not valid JSON', () => {
    const corruptedPayloadSegment = encodeUtf8ToBase64Url('isto-nao-e-um-json-{{{');
    const token = `header.${corruptedPayloadSegment}.signature`;

    const result = decodeJwtPayload(token);

    expect(result).toBeNull();
  });

  it('should return null when the payload segment is not valid Base64', () => {
    const token = 'header.***nao-e-base64***.signature';

    const result = decodeJwtPayload(token);

    expect(result).toBeNull();
  });

  it('should decode correctly even when the token has no signature segment', () => {
    const payload = { sub: 'user-789' };
    const header = encodeUtf8ToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadSegment = encodeUtf8ToBase64Url(JSON.stringify(payload));
    const tokenWithoutSignature = `${header}.${payloadSegment}`;

    const result = decodeJwtPayload(tokenWithoutSignature);

    expect(result).toEqual(payload);
  });

  it('should decode using only the second segment when the token has more than 3 parts', () => {
    const payload = { sub: 'user-extra-parts' };
    const token = buildToken(payload) + '.extra-segment';

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it.each([
    ['small payload (1-character padding)', { a: 1 }],
    ['medium payload (2-character padding)', { sub: 'abc' }],
    ['larger payload (no padding required)', { sub: 'user-123', name: 'Ana', role: UserRole.ASSISTANT, iat: 1 }],
  ])(
    'should apply Base64 padding correctly for payloads of varying sizes: %s',
    (_description, payload) => {
      const token = buildToken(payload);

      const result = decodeJwtPayload(token);

      expect(result).toEqual(payload);
    },
  );

  it('should correctly convert Base64URL special characters (- and _) present in the token', () => {
    // Chosen because it deterministically produces '+' and '/' in standard Base64 encoding.
    const payload = { sub: '>>>???...///+++' };
    const token = buildToken(payload);

    expect(token).toMatch(/[-_]/);
    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('should return null when the token is null (incorrect runtime usage)', () => {
    const result = decodeJwtPayload(null as unknown as string);

    expect(result).toBeNull();
  });

  it('should return null when the token is undefined (incorrect runtime usage)', () => {
    const result = decodeJwtPayload(undefined as unknown as string);

    expect(result).toBeNull();
  });

  it('should use the percent-encoded decoding fallback when TextDecoder is not available', () => {
    vi.stubGlobal('TextDecoder', undefined);
    const payload = { sub: 'user-fallback', name: 'Renê Fallback' };
    const token = buildToken(payload);

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('should return null when the payload segment is empty (token with a single dot)', () => {
    const result = decodeJwtPayload('.');

    expect(result).toBeNull();
  });

  it('should return null when the payload is the JSON literal "null" (indistinguishable from a decoding failure)', () => {
    const payloadSegment = encodeUtf8ToBase64Url('null');
    const token = `header.${payloadSegment}.signature`;

    const result = decodeJwtPayload(token);

    expect(result).toBeNull();
  });

  it('should return a primitive value when the payload is a primitive JSON value instead of an object', () => {
    const payloadSegment = encodeUtf8ToBase64Url('42');
    const token = `header.${payloadSegment}.signature`;

    const result = decodeJwtPayload(token);

    expect(result).toBe(42);
  });
});
