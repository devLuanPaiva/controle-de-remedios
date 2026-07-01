import { UserRole } from "@features/users/models/user.model";

interface JwtPayload {
    sub?: string;
    name?: string;
    email?: string;
    role?: UserRole
    imageUrl?: string;
    type?: string;
    iat?: number;
    exp?: number;
    [key: string]: unknown;
}

function safeBase64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);

    const binary = atob(padded);

    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    if (typeof TextDecoder !== 'undefined') {
        try {
            return new TextDecoder().decode(bytes);
        } catch {
            // fallback below
        }
    }

    let percentEncoded = '';
    for (const byte of bytes) {
        percentEncoded += '%' + ('0' + byte.toString(16)).slice(-2);
    }
    return decodeURIComponent(percentEncoded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payloadJson = safeBase64UrlDecode(parts[1]);
        const parsed = JSON.parse(payloadJson) as JwtPayload;
        return parsed;
    } catch {
        return null;
    }
}
