import { useCallback } from "react";

import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { getDeliveries } from "@/data/services/delivery.service";
import { DeliveryFilterParams, IDelivery } from "@/data/models/delivery.model";
import { PagedResult } from "@/lib/pagination";

const EMPTY_PAGE: PagedResult<IDelivery> = { data: [], currentPage: 0, totalPages: 1 };

export function useCompletedDeliveries(companyId: string | undefined, filter: DeliveryFilterParams) {
    const fetchPage = useCallback(
        (page: number) => {
            if (!companyId) {
                return Promise.resolve(EMPTY_PAGE);
            }

            return getDeliveries(companyId, page, filter);
        },
        [companyId, filter],
    );

    return usePaginatedList(fetchPage);
}
