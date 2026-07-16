import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    MedicineBalanceApiDto,
    MedicineMovementApiDto,
    MedicineMovementFilterParams,
    MedicineMovementsPage,
    toMedicineBalance,
    toMedicineMovement,
} from '../models/medicine-movement-api.model';
import { IMedicineBalance } from '../models/medicine-movement.model';

const DEFAULT_PAGE_SIZE = 20;

function buildMedicineMovementFilterParams(filter?: MedicineMovementFilterParams): Record<string, string> {
    if (!filter) {
        return {};
    }

    const params: Record<string, string> = {};

    if (filter.movementType) params['movementType'] = filter.movementType;
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class MedicineMovementService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getMovements(
        medicineId: string,
        page = 0,
        filter?: MedicineMovementFilterParams,
        size = DEFAULT_PAGE_SIZE,
    ): Observable<MedicineMovementsPage> {
        return this.http
            .get<ApiResponse<MedicineMovementApiDto[]>>(`${this.apiUrl()}/medicine-movements`, {
                params: { page, size, medicineId, ...buildMedicineMovementFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    movements: response.data.map(toMedicineMovement),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    getBalance(medicineId: string): Observable<IMedicineBalance> {
        return this.http
            .get<ApiResponse<MedicineBalanceApiDto>>(`${this.apiUrl()}/medicine-movements/balance/${medicineId}`)
            .pipe(map((response) => toMedicineBalance(response.data)));
    }
}
