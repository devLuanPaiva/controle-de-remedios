import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_URL } from "./env";
import { AUTH_STORAGE_KEYS } from "./storageKeys";

export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    count: number | null;
    currentPage: number | null;
    totalPages: number | null;
    next: string | null;
    previous: string | null;
    data: T;
}

export interface ApiErrorPayload {
    code: string;
    field: string;
    detail: string;
}

interface ApiErrorResponse {
    status: "error";
    message: string;
    data: null;
    errors: ApiErrorPayload[] | null;
}

export class ApiRequestError extends Error {
    constructor(
        message: string,
        readonly errors: ApiErrorPayload[] = [],
    ) {
        super(message);
        this.name = "ApiRequestError";
    }

    get code(): string | undefined {
        return this.errors[0]?.code;
    }

    get field(): string | undefined {
        return this.errors[0]?.field;
    }
}

function formatErrorEntry(error: ApiErrorPayload): string {
    return error.field ? `${error.field}: ${error.detail}` : error.detail;
}

function pickErrorMessage(errorBody: ApiErrorResponse | null, fallbackMessage: string): string {
    const errors = errorBody?.errors ?? [];

    if (errors.length === 0) {
        return errorBody?.message || fallbackMessage;
    }

    if (errors.length === 1) {
        return errors[0].detail || errorBody?.message || fallbackMessage;
    }

    return errors.map(formatErrorEntry).join("; ");
}

async function readAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS);
}

function buildHeaders(accessToken: string | null, extraHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(extraHeaders as Record<string, string> | undefined),
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
}

function toApiRequestError(errorBody: ApiErrorResponse | null, fallbackMessage: string): ApiRequestError {
    const message = pickErrorMessage(errorBody, fallbackMessage);
    return new ApiRequestError(message, errorBody?.errors ?? []);
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiSuccessResponse<T>> {
    const accessToken = await readAccessToken();
    const headers = buildHeaders(accessToken, options.headers);

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw toApiRequestError(body as ApiErrorResponse | null, "Erro na requisição.");
    }

    return body as ApiSuccessResponse<T>;
}
