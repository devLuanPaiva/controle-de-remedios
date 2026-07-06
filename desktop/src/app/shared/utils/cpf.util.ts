export function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);

    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function isValidCpf(value: string): boolean {
    const cpf = onlyDigits(value);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    const calculateDigit = (length: number): number => {
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += Number(cpf[i]) * (length + 1 - i);
        }
        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };

    const firstDigit = calculateDigit(9);
    const secondDigit = calculateDigit(10);

    return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}
