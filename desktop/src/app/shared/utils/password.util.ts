const RANDOM_CHAR_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

export function generateRandomPassword(length = 12): string {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    return Array.from(values, (value) => RANDOM_CHAR_POOL[value % RANDOM_CHAR_POOL.length]).join('');
}
