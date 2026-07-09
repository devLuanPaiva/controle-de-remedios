import { HttpErrorResponse } from '@angular/common/http';

import { ApiExceptionResponse } from '../models/api-error.model';

export function extractErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
        return fallback;
    }

    const body = error.error as ApiExceptionResponse | null;

    return body?.errors?.detail || body?.message || fallback;
}
