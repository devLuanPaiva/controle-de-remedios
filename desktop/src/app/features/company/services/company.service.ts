import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';
import { toUser, UserApiDto } from '@features/users/models/user-api.model';
import { IUser } from '@features/users/models/user.model';

import { CompanyApiDto, CreateCompanyRequest, UpdateCompanyRequest } from '../models/company-api.model';
import { ICompany } from '../models/company.model';

const MAX_PAGE_SIZE = 100;

function toCompany(dto: CompanyApiDto): ICompany {
    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        cnpj: dto.cnpj,
        imageUrl: dto.imageUrl ?? undefined,
        active: dto.active,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

@Injectable({
    providedIn: 'root',
})
export class CompanyService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getCompanies(): Observable<ICompany[]> {
        return this.http
            .get<ApiResponse<CompanyApiDto[]>>(`${this.apiUrl()}/companies`, {
                params: { page: 0, size: MAX_PAGE_SIZE },
            })
            .pipe(map((response) => response.data.map(toCompany)));
    }

    createCompany(payload: CreateCompanyRequest): Observable<ICompany> {
        const body = {
            ...payload,
            imageUrl: payload.imageUrl || undefined,
        };

        return this.http
            .post<ApiResponse<CompanyApiDto>>(`${this.apiUrl()}/companies`, body)
            .pipe(map((response) => toCompany(response.data)));
    }

    updateCompany(id: string, payload: UpdateCompanyRequest): Observable<ICompany> {
        const body = {
            ...payload,
            imageUrl: payload.imageUrl || undefined,
        };

        return this.http
            .patch<ApiResponse<CompanyApiDto>>(`${this.apiUrl()}/companies/${id}`, body)
            .pipe(map((response) => toCompany(response.data)));
    }

    getCompanyUsers(companyId: string): Observable<IUser[]> {
        return this.http
            .get<ApiResponse<UserApiDto[]>>(`${this.apiUrl()}/companies/${companyId}/users`, {
                params: { page: 0, size: MAX_PAGE_SIZE },
            })
            .pipe(map((response) => response.data.map(toUser)));
    }

    associateUser(companyId: string, userId: string): Observable<void> {
        return this.http
            .post<ApiResponse<null>>(`${this.apiUrl()}/companies/${companyId}/users`, { userId })
            .pipe(map(() => undefined));
    }

    removeUser(companyId: string, userId: string): Observable<void> {
        return this.http
            .delete<ApiResponse<null>>(`${this.apiUrl()}/companies/${companyId}/users/${userId}`)
            .pipe(map(() => undefined));
    }
}
