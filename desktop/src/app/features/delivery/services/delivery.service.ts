import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    CreateDeliveryRequest,
    DeliveriesPage,
    DeliveryApiDto,
    DeliveryFilterParams,
    EligiblePrescriptionApiDto,
    toDelivery,
    toEligiblePrescription,
} from '../models/delivery-api.model';
import { IDelivery, IEligiblePrescription } from '../models/delivery.model';

const DEFAULT_PAGE_SIZE = 20;

function buildDeliveryFilterParams(filter?: DeliveryFilterParams): Record<string, string> {
    if (!filter) {
        return {};
    }

    const params: Record<string, string> = {};

    if (filter.patientId) params['patientId'] = filter.patientId;
    if (filter.medicineId) params['medicineId'] = filter.medicineId;
    if (filter.medicineName) params['medicineName'] = filter.medicineName;
    if (filter.patientName) params['patientName'] = filter.patientName;
    if (filter.patientEmail) params['patientEmail'] = filter.patientEmail;
    if (filter.patientCpf) params['patientCpf'] = filter.patientCpf;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class DeliveryService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getDeliveries(
        companyId: string,
        page = 0,
        filter?: DeliveryFilterParams,
        size = DEFAULT_PAGE_SIZE,
    ): Observable<DeliveriesPage> {
        return this.http
            .get<ApiResponse<DeliveryApiDto[]>>(`${this.apiUrl()}/deliveries`, {
                params: { page, size, companyId, ...buildDeliveryFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    deliveries: response.data.map(toDelivery),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    createDelivery(payload: CreateDeliveryRequest): Observable<IDelivery> {
        return this.http
            .post<ApiResponse<DeliveryApiDto>>(`${this.apiUrl()}/deliveries`, payload)
            .pipe(map((response) => toDelivery(response.data)));
    }

    deliverPrescriptionTotal(prescriptionId: string): Observable<IDelivery[]> {
        return this.http
            .post<ApiResponse<DeliveryApiDto[]>>(`${this.apiUrl()}/deliveries/prescriptions/${prescriptionId}`, {})
            .pipe(map((response) => response.data.map(toDelivery)));
    }

    getEligiblePrescriptions(companyId: string, cpf: string): Observable<IEligiblePrescription[]> {
        return this.http
            .get<ApiResponse<EligiblePrescriptionApiDto[]>>(`${this.apiUrl()}/deliveries/eligible-prescriptions`, {
                params: { companyId, cpf },
            })
            .pipe(map((response) => response.data.map(toEligiblePrescription)));
    }
}
