import { HttpErrorResponse } from '@angular/common/http';

import { extractErrorMessage } from './api-error.util';

describe('extractErrorMessage', () => {
    it('prefers the field-level detail over the generic message when both are present', () => {
        const error = new HttpErrorResponse({
            status: 400,
            error: {
                status: 'error',
                message: 'Erro de validação',
                data: null,
                errors: { code: 'VALIDATION_ERROR', field: 'name, cnpj', detail: 'name: não deve estar em branco; cnpj: CNPJ inválido' },
            },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe('name: não deve estar em branco; cnpj: CNPJ inválido');
    });

    it('falls back to the generic message when there is no detail', () => {
        const error = new HttpErrorResponse({
            status: 500,
            error: { status: 'error', message: 'Erro interno do servidor', data: null, errors: null },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe('Erro interno do servidor');
    });

    it('falls back to the provided fallback when the body has neither detail nor message', () => {
        const error = new HttpErrorResponse({ status: 0, error: null });

        expect(extractErrorMessage(error, 'fallback')).toBe('fallback');
    });

    it('falls back to the provided fallback when the error is not an HttpErrorResponse', () => {
        expect(extractErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    });
});
