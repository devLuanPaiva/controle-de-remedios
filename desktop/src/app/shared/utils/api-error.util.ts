import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorDetail, ApiExceptionResponse } from '../models/api-error.model';

function extractErrorBody(error: unknown): ApiExceptionResponse | null {
    if (!(error instanceof HttpErrorResponse)) {
        return null;
    }

    return error.error as ApiExceptionResponse | null;
}

function formatErrorDetail(error: ApiErrorDetail): string {
    return error.field ? `${error.field}: ${error.detail}` : (error.detail ?? '');
}

export function extractErrors(error: unknown): ApiErrorDetail[] {
    return extractErrorBody(error)?.errors ?? [];
}

export function extractErrorMessage(error: unknown, fallback: string): string {
    const body = extractErrorBody(error);
    const errors = body?.errors ?? [];

    if (errors.length === 0) {
        return body?.message || fallback;
    }

    if (errors.length === 1) {
        return errors[0].detail || body?.message || fallback;
    }

    return errors.map(formatErrorDetail).join('; ');
}
