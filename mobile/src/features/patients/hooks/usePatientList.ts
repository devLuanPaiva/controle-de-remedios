import { useCallback } from "react";

import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { getPatients } from "@/data/services/patient.service";
import { IPatient, PatientFilterParams } from "@/data/models/patient.model";
import { PagedResult } from "@/lib/pagination";

const EMPTY_PAGE: PagedResult<IPatient> = { data: [], currentPage: 0, totalPages: 1 };

export function usePatientList(companyId: string | undefined, filter: PatientFilterParams) {
    const fetchPage = useCallback(
        (page: number) => {
            if (!companyId) {
                return Promise.resolve(EMPTY_PAGE);
            }

            return getPatients(companyId, page, filter);
        },
        [companyId, filter],
    );

    return usePaginatedList(fetchPage);
}
