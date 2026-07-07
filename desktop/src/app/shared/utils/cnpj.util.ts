import { onlyDigits } from './cpf.util';

export { onlyDigits };

export function formatCnpj(value: string): string {
    const digits = onlyDigits(value).slice(0, 14);

    return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function isValidCnpj(value: string): boolean {
    const cnpj = onlyDigits(value);

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }

    const calculateDigit = (weights: number[]): number => {
        const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstDigit = calculateDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const secondDigit = calculateDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}
