import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    CreatePrescriptionRequest,
    PrescriptionApiDto,
    PrescriptionDetailApiDto,
    PrescriptionFilterParams,
    PrescriptionListItemApiDto,
    PrescriptionsPage,
    toPrescription,
    toPrescriptionDetail,
    toPrescriptionListItem,
    UpdatePrescriptionRequest,
} from '../models/prescription-api.model';
import { IPrescription, IPrescriptionDetail } from '../models/prescription.model';
import {
    PrescriptionItemApiDto,
    toPrescriptionItem,
    UpdatePrescriptionItemRequest,
} from '../models/prescription-item-api.model';
import { IPrescriptionItem } from '../models/prescription-item.model';

const DEFAULT_PAGE_SIZE = 20;

function buildPrescriptionFilterParams(filter?: PrescriptionFilterParams): Record<string, string> {
    if (!filter) {
        return {};
    }

    const params: Record<string, string> = {};

    if (filter.patientId) params['patientId'] = filter.patientId;
    if (filter.patientName) params['patientName'] = filter.patientName;
    if (filter.patientCpf) params['patientCpf'] = filter.patientCpf;
    if (filter.status) params['status'] = filter.status;
    if (filter.issueDate) params['issueDate'] = filter.issueDate;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class PrescriptionService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getPrescriptions(page = 0, filter?: PrescriptionFilterParams, size = DEFAULT_PAGE_SIZE): Observable<PrescriptionsPage> {
        return this.http
            .get<ApiResponse<PrescriptionListItemApiDto[]>>(`${this.apiUrl()}/prescriptions`, {
                params: { page, size, ...buildPrescriptionFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    prescriptions: response.data.map(toPrescriptionListItem),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    getPrescriptionById(id: string): Observable<IPrescriptionDetail> {
        return this.http
            .get<ApiResponse<PrescriptionDetailApiDto>>(`${this.apiUrl()}/prescriptions/${id}`)
            .pipe(map((response) => toPrescriptionDetail(response.data)));
    }

    createPrescription(payload: CreatePrescriptionRequest): Observable<IPrescription> {
        return this.http
            .post<ApiResponse<PrescriptionApiDto>>(`${this.apiUrl()}/prescriptions`, payload)
            .pipe(map((response) => toPrescription(response.data)));
    }

    updatePrescription(id: string, payload: UpdatePrescriptionRequest): Observable<IPrescription> {
        return this.http
            .patch<ApiResponse<PrescriptionApiDto>>(`${this.apiUrl()}/prescriptions/${id}`, payload)
            .pipe(map((response) => toPrescription(response.data)));
    }

    deletePrescription(id: string): Observable<void> {
        return this.http
            .delete<ApiResponse<null>>(`${this.apiUrl()}/prescriptions/${id}`)
            .pipe(map(() => undefined));
    }

    updatePrescriptionItem(id: string, payload: UpdatePrescriptionItemRequest): Observable<IPrescriptionItem> {
        return this.http
            .patch<ApiResponse<PrescriptionItemApiDto>>(`${this.apiUrl()}/prescription-items/${id}`, payload)
            .pipe(map((response) => toPrescriptionItem(response.data)));
    }
}
