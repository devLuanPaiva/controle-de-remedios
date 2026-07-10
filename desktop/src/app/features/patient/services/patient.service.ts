import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { toUser, UserApiDto } from '@features/users/models/user-api.model';
import { IUser } from '@features/users/models/user.model';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    CreatePatientAccountRequest,
    CreatePatientRequest,
    CreatePatientWithAccountRequest,
    PatientApiDto,
    PatientFilterParams,
    PatientsPage,
    toPatient,
    UpdatePatientRequest,
} from '../models/patient-api.model';
import { IPatient } from '../models/patient.model';

const DEFAULT_PAGE_SIZE = 20;

function buildPatientFilterParams(filter?: PatientFilterParams): Record<string, string> {
    if (!filter) {
        return {};
    }

    const params: Record<string, string> = {};

    if (filter.companyId) params['companyId'] = filter.companyId;
    if (filter.name) params['name'] = filter.name;
    if (filter.cpf) params['cpf'] = filter.cpf;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class PatientService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getPatients(page = 0, filter?: PatientFilterParams, size = DEFAULT_PAGE_SIZE): Observable<PatientsPage> {
        return this.http
            .get<ApiResponse<PatientApiDto[]>>(`${this.apiUrl()}/patients`, {
                params: { page, size, ...buildPatientFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    patients: response.data.map(toPatient),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    getPatientById(id: string): Observable<IPatient> {
        return this.http
            .get<ApiResponse<PatientApiDto>>(`${this.apiUrl()}/patients/${id}`)
            .pipe(map((response) => toPatient(response.data)));
    }

    createPatient(payload: CreatePatientRequest): Observable<IPatient> {
        return this.http
            .post<ApiResponse<PatientApiDto>>(`${this.apiUrl()}/patients`, payload)
            .pipe(map((response) => toPatient(response.data)));
    }

    createPatientWithAccount(payload: CreatePatientWithAccountRequest): Observable<IPatient> {
        const body = { ...payload, imageUrl: payload.imageUrl || undefined };

        return this.http
            .post<ApiResponse<PatientApiDto>>(`${this.apiUrl()}/patients/with-account`, body)
            .pipe(map((response) => toPatient(response.data)));
    }

    updatePatient(id: string, payload: UpdatePatientRequest): Observable<IPatient> {
        return this.http
            .patch<ApiResponse<PatientApiDto>>(`${this.apiUrl()}/patients/${id}`, payload)
            .pipe(map((response) => toPatient(response.data)));
    }

    deletePatient(id: string): Observable<void> {
        return this.http
            .delete<ApiResponse<null>>(`${this.apiUrl()}/patients/${id}`)
            .pipe(map(() => undefined));
    }

    createPatientAccount(patientId: string, payload: CreatePatientAccountRequest): Observable<IUser> {
        return this.http
            .post<ApiResponse<UserApiDto>>(`${this.apiUrl()}/patients/${patientId}/account`, payload)
            .pipe(map((response) => toUser(response.data)));
    }

    removePatientAccount(patientId: string): Observable<void> {
        return this.http
            .delete<ApiResponse<null>>(`${this.apiUrl()}/patients/${patientId}/account`)
            .pipe(map(() => undefined));
    }
}
