export function formatPercent(rate: number | null): string {
    if (rate === null) {
        return '—';
    }

    return `${Math.round(rate * 100)}%`;
}

export function formatDays(days: number | null): string {
    if (days === null) {
        return '—';
    }

    const rounded = Math.round(days);
    return `${rounded} ${rounded === 1 ? 'dia' : 'dias'}`;
}

export function formatDaysUntil(days: number): string {
    if (days === 0) {
        return 'Hoje';
    }

    if (days === 1) {
        return 'Amanhã';
    }

    if (days > 1) {
        return `Em ${days} dias`;
    }

    const overdueDays = Math.abs(days);
    return `${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'} em atraso`;
}

export function formatShortDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
