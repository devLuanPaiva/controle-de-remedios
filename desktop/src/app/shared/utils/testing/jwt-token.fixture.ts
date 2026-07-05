
export function encodeUtf8ToBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function buildJwtToken(payload: unknown, options?: { signature?: string }): string {
  const header = encodeUtf8ToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadSegment = encodeUtf8ToBase64Url(JSON.stringify(payload));
  const signature = options?.signature ?? 'fake-signature';
  return `${header}.${payloadSegment}.${signature}`;
}
