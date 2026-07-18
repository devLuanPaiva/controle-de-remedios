import { HttpErrorResponse } from '@angular/common/http';

import { extractErrorMessage, extractErrors } from './api-error.util';

describe('extractErrorMessage', () => {
    it('uses the single error detail over the generic message when there is exactly one error', () => {
        const error = new HttpErrorResponse({
            status: 409,
            error: {
                status: 'error',
                message: 'Remédio ainda está no prazo de tratamento anterior',
                data: null,
                errors: [
                    {
                        code: 'MEDICINE_STILL_IN_TREATMENT_PERIOD',
                        field: 'items[0].medicineId',
                        detail: "O remédio 'Itraconazol' só estará disponível novamente em 01/08/2026.",
                    },
                ],
            },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe(
            "O remédio 'Itraconazol' só estará disponível novamente em 01/08/2026.",
        );
    });

    it('joins multiple error entries as "field: detail" when there is more than one', () => {
        const error = new HttpErrorResponse({
            status: 400,
            error: {
                status: 'error',
                message: 'Erro de validação',
                data: null,
                errors: [
                    { code: 'VALIDATION_ERROR', field: 'name', detail: 'não deve estar em branco' },
                    { code: 'VALIDATION_ERROR', field: 'cnpj', detail: 'CNPJ inválido' },
                ],
            },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe(
            'name: não deve estar em branco; cnpj: CNPJ inválido',
        );
    });

    it('falls back to the generic message when there are no errors', () => {
        const error = new HttpErrorResponse({
            status: 500,
            error: { status: 'error', message: 'Erro interno do servidor', data: null, errors: [] },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe('Erro interno do servidor');
    });

    it('falls back to the generic message when errors is null', () => {
        const error = new HttpErrorResponse({
            status: 500,
            error: { status: 'error', message: 'Erro interno do servidor', data: null, errors: null },
        });

        expect(extractErrorMessage(error, 'fallback')).toBe('Erro interno do servidor');
    });

    it('falls back to the provided fallback when the body has neither errors nor message', () => {
        const error = new HttpErrorResponse({ status: 0, error: null });

        expect(extractErrorMessage(error, 'fallback')).toBe('fallback');
    });

    it('falls back to the provided fallback when the error is not an HttpErrorResponse', () => {
        expect(extractErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    });
});

describe('extractErrors', () => {
    it('returns the raw error array from the response body', () => {
        const error = new HttpErrorResponse({
            status: 400,
            error: {
                status: 'error',
                message: 'Erro de validação',
                data: null,
                errors: [
                    { code: 'VALIDATION_ERROR', field: 'items[0].dosage', detail: 'não deve estar em branco' },
                    { code: 'VALIDATION_ERROR', field: 'items[1].prescribedQuantity', detail: 'deve ser positivo' },
                ],
            },
        });

        expect(extractErrors(error)).toEqual([
            { code: 'VALIDATION_ERROR', field: 'items[0].dosage', detail: 'não deve estar em branco' },
            { code: 'VALIDATION_ERROR', field: 'items[1].prescribedQuantity', detail: 'deve ser positivo' },
        ]);
    });

    it('returns an empty array when there is no error body or the error is not an HttpErrorResponse', () => {
        expect(extractErrors(new Error('boom'))).toEqual([]);
        expect(extractErrors(new HttpErrorResponse({ status: 0, error: null }))).toEqual([]);
    });
});
