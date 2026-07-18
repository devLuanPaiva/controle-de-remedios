import { ApiErrorPayload } from "@/lib/apiFetch";
import { PrescriptionItemDraft } from "@/data/models/prescription-item.model";

const ITEM_FIELD_PATTERN = /^items\[(\d+)\]/;

export function mapItemFieldErrors(
    errors: ApiErrorPayload[],
    items: PrescriptionItemDraft[],
): Record<string, string> {
    const errorsByLocalId: Record<string, string> = {};

    for (const error of errors) {
        const match = ITEM_FIELD_PATTERN.exec(error.field);
        const item = match ? items[Number(match[1])] : undefined;

        if (item) {
            errorsByLocalId[item.localId] = error.detail;
        }
    }

    return errorsByLocalId;
}
