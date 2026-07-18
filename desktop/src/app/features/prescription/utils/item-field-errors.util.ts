import { ApiErrorDetail } from '@shared/models/api-error.model';

const ITEM_FIELD_PATTERN = /^items\[(\d+)\]/;

export function mapItemFieldErrors(errors: ApiErrorDetail[]): Record<number, string> {
    const errorsByIndex: Record<number, string> = {};

    for (const error of errors) {
        const match = error.field ? ITEM_FIELD_PATTERN.exec(error.field) : null;

        if (match && error.detail) {
            errorsByIndex[Number(match[1])] = error.detail;
        }
    }

    return errorsByIndex;
}
