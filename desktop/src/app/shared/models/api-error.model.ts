export interface ApiErrorDetail {
    code: string;
    field: string | null;
    detail: string | null;
}

export interface ApiExceptionResponse {
    status: string;
    message: string;
    data: unknown;
    errors: ApiErrorDetail[] | null;
}
