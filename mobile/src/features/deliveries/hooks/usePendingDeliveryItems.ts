import { useCallback } from "react";

import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { getPendingDeliveryItems } from "@/data/services/delivery.service";
import { DeliveryFilterParams, IPendingDeliveryItem } from "@/data/models/delivery.model";
import { PagedResult } from "@/lib/pagination";

const EMPTY_PAGE: PagedResult<IPendingDeliveryItem> = { data: [], currentPage: 0, totalPages: 1 };

export function usePendingDeliveryItems(companyId: string | undefined, filter: DeliveryFilterParams) {
    const fetchPage = useCallback(
        (page: number) => {
            if (!companyId) {
                return Promise.resolve(EMPTY_PAGE);
            }

            return getPendingDeliveryItems(companyId, page, filter);
        },
        [companyId, filter],
    );

    return usePaginatedList(fetchPage);
}
