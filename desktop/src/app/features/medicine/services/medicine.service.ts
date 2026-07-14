import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    CreateMedicineRequest,
    MedicineApiDto,
    MedicineFilterParams,
    MedicinesPage,
    toMedicine,
} from '../models/medicine-api.model';
import { IMedicine } from '../models/medicine.model';

const DEFAULT_PAGE_SIZE = 20;

function buildMedicineFilterParams(filter?: MedicineFilterParams): Record<string, string> {
    if (!filter) {
        return {};
    }

    const params: Record<string, string> = {};

    if (filter.name) params['name'] = filter.name;
    if (filter.eanCode) params['eanCode'] = filter.eanCode;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class MedicineService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getCompanyMedicines(
        companyId: string,
        page = 0,
        filter?: MedicineFilterParams,
        size = DEFAULT_PAGE_SIZE,
    ): Observable<MedicinesPage> {
        return this.http
            .get<ApiResponse<MedicineApiDto[]>>(`${this.apiUrl()}/companies/${companyId}/medicines`, {
                params: { page, size, ...buildMedicineFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    medicines: response.data.map(toMedicine),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    createMedicine(payload: CreateMedicineRequest): Observable<IMedicine> {
        return this.http
            .post<ApiResponse<MedicineApiDto>>(`${this.apiUrl()}/medicines`, payload)
            .pipe(map((response) => toMedicine(response.data)));
    }
}
