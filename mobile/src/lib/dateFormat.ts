const BR_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidBrDate(value: string): boolean {
    const match = BR_DATE_PATTERN.exec(value);
    if (!match) {
        return false;
    }

    const [, day, month, year] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return (
        date.getFullYear() === Number(year) &&
        date.getMonth() === Number(month) - 1 &&
        date.getDate() === Number(day)
    );
}

export function brToIso(value: string): string {
    const match = BR_DATE_PATTERN.exec(value);
    if (!match) {
        throw new Error("Data inválida.");
    }

    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}

export function isoToBr(value: string): string {
    const match = ISO_DATE_PATTERN.exec(value);
    if (!match) {
        return "";
    }

    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
}

export function isPastOrPresentBrDate(value: string): boolean {
    if (!isValidBrDate(value)) {
        return false;
    }

    const [, day, month, year] = BR_DATE_PATTERN.exec(value)!;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return date <= today;
}

export function formatDateBr(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function formatTimeBr(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export function todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}
