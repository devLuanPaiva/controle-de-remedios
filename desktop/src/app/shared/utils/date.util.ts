export function toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function isNotFutureDate(value: string, today: Date): boolean {
    if (!value) {
        return true;
    }

    return value <= toDateInputValue(today);
}
