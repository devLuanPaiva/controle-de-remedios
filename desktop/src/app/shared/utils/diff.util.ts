export function diffPrimitive<T extends string | number | boolean>(
    original: T,
    current: T,
): T | undefined {
    return original === current ? undefined : current;
}

export function diffStringArray(original: string[], current: string[]): string[] | undefined {
    const same = original.length === current.length && original.every((value, index) => value === current[index]);

    return same ? undefined : current;
}
